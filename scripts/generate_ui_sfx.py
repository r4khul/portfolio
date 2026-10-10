"""
Synthesize the site's tactile UI sounds from scratch (pure numpy DSP, no samples).

    click.mp3   - every tactile button / link press (played at volume 0.45)
    switch.mp3  - theme toggle and sound on/off toggle (played at volume 1.0)

Both sounds are built from the same "tick" voice so they read as one family:

    tick = filtered noise transient   (the crisp "t" of a switch stem / wood tap)
         + 2-3 damped modal partials  (the tiny resonant body of the keycap)
         + a sub-perceptual low thump (physical weight; inaudible on laptops)

Each event starts from silence, rises over a fraction of a millisecond and
decays to true zero, so rapid re-triggers (`audio.currentTime = 0`) never pop.

Usage:
    python scripts/generate_ui_sfx.py [output_dir]      # default: ./public/sfx

Requires numpy and ffmpeg (with libmp3lame) on PATH. Output is deterministic.
"""

import os
import subprocess
import sys
import wave

import numpy as np

SAMPLE_RATE = 44100
SEED = 9177
DEFAULT_OUT_DIR = os.path.join(".", "public", "sfx")

# Peak targets (dBFS) of the *decoded* MP3s.
# click.mp3 is played at volume 0.45 (~ -7 dB), switch.mp3 at full volume, so
# switch is mastered quieter to land just slightly above the click in the room.
CLICK_PEAK_DB = -6.0
SWITCH_PEAK_DB = -10.0


# --- DSP Helpers ---

def ms(milliseconds):
    """Milliseconds -> whole samples."""
    return int(round(milliseconds * SAMPLE_RATE / 1000.0))


def biquad(data, b, a):
    """Direct-form-I biquad: b = (b0, b1, b2), a = (1, a1, a2)."""
    b0, b1, b2 = (c / a[0] for c in b)
    a1, a2 = a[1] / a[0], a[2] / a[0]
    out = np.zeros_like(data)
    x1 = x2 = y1 = y2 = 0.0
    for i, x in enumerate(data):
        y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2
        out[i] = y
        x2, x1 = x1, x
        y2, y1 = y1, y
    return out


def _rbj(kind, freq, q=0.7071, gain_db=0.0):
    """RBJ Audio-EQ-Cookbook coefficients for the few shapes we need."""
    w0 = 2 * np.pi * freq / SAMPLE_RATE
    cos_w0, sin_w0 = np.cos(w0), np.sin(w0)
    alpha = sin_w0 / (2 * q)
    if kind == "lowpass":
        b = ((1 - cos_w0) / 2, 1 - cos_w0, (1 - cos_w0) / 2)
        a = (1 + alpha, -2 * cos_w0, 1 - alpha)
    elif kind == "highpass":
        b = ((1 + cos_w0) / 2, -(1 + cos_w0), (1 + cos_w0) / 2)
        a = (1 + alpha, -2 * cos_w0, 1 - alpha)
    elif kind == "bandpass":  # constant 0 dB peak gain
        b = (alpha, 0.0, -alpha)
        a = (1 + alpha, -2 * cos_w0, 1 - alpha)
    elif kind == "highshelf":
        amp = 10 ** (gain_db / 40)
        sq = 2 * np.sqrt(amp) * alpha
        b = (amp * ((amp + 1) + (amp - 1) * cos_w0 + sq),
             -2 * amp * ((amp - 1) + (amp + 1) * cos_w0),
             amp * ((amp + 1) + (amp - 1) * cos_w0 - sq))
        a = ((amp + 1) - (amp - 1) * cos_w0 + sq,
             2 * ((amp - 1) - (amp + 1) * cos_w0),
             (amp + 1) - (amp - 1) * cos_w0 - sq)
    else:
        raise ValueError(kind)
    return b, a


def lowpass(data, freq, q=0.7071):
    return biquad(data, *_rbj("lowpass", freq, q))


def highpass(data, freq, q=0.7071):
    return biquad(data, *_rbj("highpass", freq, q))


def bandpass(data, freq, q):
    return biquad(data, *_rbj("bandpass", freq, q))


def high_shelf(data, freq, gain_db):
    return biquad(data, *_rbj("highshelf", freq, 0.7071, gain_db))


def dc_block(data, pole=0.995):
    """One-pole DC blocker: y[n] = x[n] - x[n-1] + pole * y[n-1]  (~35 Hz)."""
    return biquad(data, (1.0, -1.0, 0.0), (1.0, -pole, 0.0))


def fade(data, fade_in_ms, fade_out_ms):
    """Raised-cosine fades so the file starts and ends at exactly zero."""
    out = data.copy()
    n_in, n_out = ms(fade_in_ms), ms(fade_out_ms)
    if n_in:
        out[:n_in] *= 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, n_in))
    if n_out:
        out[-n_out:] *= 0.5 + 0.5 * np.cos(np.linspace(0, np.pi, n_out))
    out[0] = out[-1] = 0.0
    return out


def normalize(data, peak_db):
    return data / np.max(np.abs(data)) * 10 ** (peak_db / 20)


# --- The shared "tick" voice ---

def tick(rng, length_ms, noise_hz, noise_q, noise_decay_ms, modes, thump_hz, thump_level,
         noise_level=1.0):
    """
    One tactile micro-event, starting at sample 0.

    noise_*  : band-passed white-noise burst - the crisp contact transient.
    modes    : [(freq_hz, decay_ms, level), ...] damped partials - the tiny body.
               They start at sine phase 0 (no step) and decay exponentially.
    thump_*  : a single soft low-frequency pressure pulse for physicality.
    """
    n = ms(length_ms)
    t = np.arange(n) / SAMPLE_RATE

    # 0.4 ms half-cosine attack takes the digital edge off every layer.
    attack = np.ones(n)
    n_att = ms(0.4)
    attack[:n_att] = 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, n_att))

    # (a) transient: noise -> two cascaded band-passes (steeper skirts, less hiss)
    noise = rng.standard_normal(n)
    burst = noise * np.exp(-t / (noise_decay_ms / 1000.0)) * attack
    burst = bandpass(bandpass(burst, noise_hz, noise_q), noise_hz, noise_q)
    burst = burst / (np.max(np.abs(burst)) + 1e-12) * noise_level

    # (b) body: damped modal partials
    body = np.zeros(n)
    for freq, decay_ms, level in modes:
        body += level * np.sin(2 * np.pi * freq * t) * np.exp(-t / (decay_ms / 1000.0))
    body *= attack

    # (c) thump: half-sine-ish low pulse, decays within a single cycle
    thump = thump_level * np.sin(2 * np.pi * thump_hz * t) * np.exp(-t / 0.004) * attack

    return burst + body + thump


def master(data, lead_in_ms, fade_out_ms, peak_db):
    """Shared finishing chain: DC-block, de-harsh the top end, fades, level."""
    out = dc_block(data)
    out = highpass(out, 90.0)                 # keep laptop speakers from flapping
    out = high_shelf(out, 6500.0, -4.0)       # soften the top so nothing is shrill
    out = lowpass(out, 9000.0)                # ... and remove what's above ~9 kHz
    out = np.concatenate([np.zeros(ms(lead_in_ms)), out])
    out = fade(out, lead_in_ms + 0.6, fade_out_ms)
    return normalize(out, peak_db)


# --- Sound Effect Synthesis ---

def make_click(rng):
    """
    click: one soft, crisp keycap tick (~40 ms audible).
    A 3.4 kHz noise snap over a ~2.1 kHz cap resonance and a woody ~700 Hz
    mode. Short decays everywhere so it never "rings" into a beep.
    """
    voice = tick(
        rng, length_ms=62,
        noise_hz=3400.0, noise_q=1.1, noise_decay_ms=1.6,
        modes=[(2150.0, 7.0, 0.46),   # cap / plate mode
               (3350.0, 3.0, 0.18),   # upper partial (inharmonic: ~1.56x)
               (720.0, 8.0, 0.20)],   # soft wooden lower mode
        thump_hz=130.0, thump_level=0.18,
    )
    return master(voice, lead_in_ms=1.0, fade_out_ms=24.0, peak_db=CLICK_PEAK_DB)


def make_switch(rng):
    """
    switch: a rocker toggle - a duller "press" tick, then 32 ms later a brighter
    "latch" tick with a touch more weight, followed by the faintest airy tail.
    Same voice and mode ratios as click, so the two sound like one object.
    """
    total = ms(118)
    latch_at = ms(32.0)                       # press -> latch spacing
    n_tail = total - latch_at                 # samples from latch to end of file
    out = np.zeros(total)

    # 1. press - slightly lower / softer than click
    press = tick(
        rng, length_ms=60,
        noise_hz=3000.0, noise_q=1.1, noise_decay_ms=1.2,
        modes=[(1900.0, 6.0, 0.42), (2960.0, 2.6, 0.14), (640.0, 7.0, 0.22)],
        thump_hz=120.0, thump_level=0.16,
    ) * 0.7
    out[:len(press)] += press

    # 2. latch - brighter snap, a hair longer body (the mechanism seating)
    latch = tick(
        rng, length_ms=n_tail * 1000.0 / SAMPLE_RATE,
        noise_hz=4300.0, noise_q=1.2, noise_decay_ms=1.6,
        modes=[(2450.0, 8.0, 0.46), (3820.0, 3.4, 0.20), (780.0, 9.0, 0.22)],
        thump_hz=140.0, thump_level=0.22,
    )
    out[latch_at:] += latch

    # 3. air - very quiet band-passed noise breath after the latch
    t_air = np.arange(n_tail) / SAMPLE_RATE
    air = rng.standard_normal(n_tail)
    air = bandpass(air, 6000.0, 0.8)
    swell = (1 - np.exp(-t_air / 0.004)) * np.exp(-t_air / 0.030)
    out[latch_at:] += air / np.max(np.abs(air)) * swell * 0.09

    return master(out, lead_in_ms=1.0, fade_out_ms=40.0, peak_db=SWITCH_PEAK_DB)


# --- Output ---

def write_wav(filepath, data):
    """Save 16-bit PCM mono WAV (TPDF-dithered)."""
    rng = np.random.default_rng(SEED + 1)
    dither = (rng.random(len(data)) - rng.random(len(data))) / 32768.0
    dither[[0, -1]] = 0.0                     # keep the exact-zero endpoints
    pcm = np.clip(np.round((data + dither) * 32767), -32768, 32767).astype("<i2")
    with wave.open(filepath, "wb") as wav_file:
        wav_file.setparams((1, 2, SAMPLE_RATE, len(pcm), "NONE", "not compressed"))
        wav_file.writeframes(pcm.tobytes())


def encode_mp3(wav_path, mp3_path):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", wav_path,
                    "-c:a", "libmp3lame", "-b:a", "128k", mp3_path], check=True)


def decoded_peak_db(mp3_path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", mp3_path, "-f", "f32le", "-"],
                         check=True, capture_output=True).stdout
    return 20 * np.log10(np.max(np.abs(np.frombuffer(raw, dtype=np.float32))))


def render(out_dir, name, data, peak_db):
    """Write WAV + MP3; nudge the level once so the *decoded* MP3 hits peak_db."""
    wav_path = os.path.join(out_dir, name + ".wav")
    mp3_path = os.path.join(out_dir, name + ".mp3")
    write_wav(wav_path, data)
    encode_mp3(wav_path, mp3_path)
    error_db = decoded_peak_db(mp3_path) - peak_db
    if abs(error_db) > 0.1:                   # MP3 overshoot correction
        write_wav(wav_path, data * 10 ** (-error_db / 20))
        encode_mp3(wav_path, mp3_path)
    print(f"Generated: {mp3_path} ({len(data) / SAMPLE_RATE * 1000:.0f} ms, "
          f"peak {decoded_peak_db(mp3_path):.1f} dBFS)")


if __name__ == "__main__":
    out_dir = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_OUT_DIR
    os.makedirs(out_dir, exist_ok=True)
    print("Synthesizing tactile UI sounds...")
    render(out_dir, "click", make_click(np.random.default_rng(SEED)), CLICK_PEAK_DB)
    render(out_dir, "switch", make_switch(np.random.default_rng(SEED + 2)), SWITCH_PEAK_DB)
    print(f"Done. Files written to {out_dir}/")
