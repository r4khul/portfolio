#!/usr/bin/env python3
"""Render the looping underscore for the "Game Console & Ice Tubes" memory.

Run ``python3 scripts/generate_slides_bed.py`` from the repository, with ffmpeg on
PATH (or supply --ffmpeg). The music is synthesized with the Python standard
library alone: no recordings, samples, downloads, or borrowed melody. ffmpeg is
used only at the end, to encode the finished loop as AAC (.m4a) and Opus (.ogg).

The memory is a quiet one: a night bicycle ride through Nagercoil, a game console
that has sold out, ice tubes bought instead, and a slow ride home. The bed should
be felt under the words rather than followed. It is music only: a warm, light F
major pad moves one chord every twelve seconds, and a small music-box motif
appears now and then with plenty of space. The harmony sits mostly above middle
C, over a thin root voice, and a gentle 170 Hz high-pass leaves almost no low end
or rumble on headphones. There are no drums, vocals, ambience, risers or swells,
so later scene sounds have room on top.

Everything is rendered circularly. Every held note, music-box ring, filter state
and reverb tail that runs past the end of the loop is wrapped to its start, and
every slow modulation completes a whole number of cycles per loop. The last
sample therefore flows into the first with no crossfade, gap or level step.
Delivery is resampled 3:2 to 48 kHz from three consecutive copies of the loop,
so the resampler never sees an edge either, and each encode begins with a short
lead-in that its container tells the decoder to discard (see encode()).

The 24-bit master WAV goes to a temporary folder unless --wav names a path; it is
not checked in. The script is deterministic: every random choice comes from a
fixed seed, so repeated runs render identical audio.
"""

from __future__ import annotations

import argparse
from array import array
from itertools import accumulate, count, islice, repeat
import math
from operator import add, lshift, mul
from pathlib import Path
import random
import shutil
import subprocess
import sys
import tempfile
import time
import wave


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "sfx" / "slides"
STEM = "game-console-bed"
SEED = "game-console-ice-tubes"

RATE = 32000            # render rate; keeps pure-Python synthesis quick
DELIVERY_RATE = 48000   # encoded rate (Opus always runs at 48 kHz); exactly 3:2
TAU = 2 * math.pi

# Nominal 60 BPM in 4/4: each chord holds for three bars (12 seconds), and the
# eight-chord progression is the whole loop (24 bars, 96 seconds).
TEMPO = 60
CHORD_SECONDS = 3 * 4 * 60 / TEMPO
CHORDS = ("Fmaj9", "G6/F", "Am7", "Bbmaj9", "Fadd9/A", "Dm9", "Bbmaj7#11", "C9sus4")
LOOP_SECONDS = CHORD_SECONDS * len(CHORDS)
FRAMES = round(LOOP_SECONDS * RATE)

# A thin root voice and four upper voices, one pitch per chord. The upper voices
# stay between C4 and E5; only the quiet root dips below middle C. Repeated
# pitches (including across the loop seam) are held as one note, so common tones
# never re-attack, and C9sus4 resolves into Fmaj9 by step across the seam.
VOICES = (
    # gain, detune (cents), pan, pitch for each chord
    (0.36, 4.0, 0.00, ("F3", "F3", "A3", "Bb3", "A3", "D3", "Bb3", "C4")),
    (0.62, 3.2, -0.30, ("C4", "D4", "C4", "D4", "C4", "C4", "D4", "D4")),
    (0.56, 2.8, 0.30, ("E4", "E4", "E4", "F4", "F4", "F4", "F4", "F4")),
    (0.50, 2.4, -0.42, ("G4", "G4", "G4", "A4", "G4", "A4", "A4", "G4")),
    (0.42, 2.0, 0.42, ("A4", "B4", "A4", "C5", "C5", "E5", "E5", "Bb4")),
)
PAD_PARTIALS = (1.0, 0.36, 0.15, 0.06)   # soft, organ/flute-like harmonic weights
PAD_CUTOFF = 900.0                       # gentle 6 dB/octave roll-off applied per partial
PAD_FADE_SECONDS = 7.0                   # equal-power crossfade between chords
BREATH_CYCLES = (3, 5, 4, 7, 6)          # per-voice level drift, whole cycles per loop
BREATH_DEPTH = 0.07

# A sparse music-box motif: a few notes now and then, in the F major pentatonic
# with chord-tone colours (B over G/F, E over Bb). The recurring short-short-long
# figure is the childlike idea; most of the loop is left empty. It sits above the
# pad, between E5 and E6.
MOTIF = (
    # seconds, note, velocity, pan
    (3.00, "A5", 0.80, -0.20),   # Fmaj9: a small question, mi-sol-re
    (3.52, "C6", 0.66, 0.08),
    (4.56, "G5", 0.84, -0.04),
    (17.40, "D6", 0.44, 0.30),   # G6/F: two distant lydian glints
    (17.92, "B5", 0.38, 0.24),
    (27.00, "E5", 0.60, -0.26),  # Am7: a climb with a small bounce at the top
    (27.50, "G5", 0.66, -0.12),
    (28.02, "A5", 0.74, 0.04),
    (28.27, "C6", 0.40, 0.14),
    (30.10, "G5", 0.46, 0.18),
    (39.50, "D6", 0.64, 0.22),   # Bbmaj9: the answer falls
    (40.02, "C6", 0.60, 0.10),
    (41.06, "A5", 0.72, -0.08),
    (53.80, "C6", 0.36, -0.32),  # Fadd9/A: one faraway note
    (63.00, "A5", 0.78, -0.18),  # Dm9: the opening question, reaching a step higher
    (63.52, "C6", 0.64, 0.06),
    (64.56, "D6", 0.70, 0.16),
    (66.30, "A5", 0.40, -0.04),
    (76.00, "F5", 0.56, 0.24),   # Bbmaj7#11: fifth, major seventh, raised fourth
    (76.52, "A5", 0.52, 0.12),
    (77.56, "E6", 0.38, -0.02),
    (88.00, "D6", 0.42, -0.22),  # C9sus4: leaning back toward the first A
    (88.52, "G5", 0.50, -0.10),
)
CHIME_SECONDS = 6.0

REVERB_COMBS = (1103, 1171, 1237, 1301, 1373, 1451, 1531, 1601)
REVERB_ALLPASSES = ((389, 307, 233, 163), (401, 317, 241, 173))
REVERB_SPREAD = 37
REVERB_T60 = 2.8
REVERB_WARM_SECONDS = 12.0
PAD_SEND = 0.10

# Layer balance, relative to the pad's RMS. Only the music box may rise above
# the pad, and only briefly.
MOTIF_PEAK = 1.15      # dry music-box peak
REVERB_RATIO = 0.80    # reverb RMS relative to the RMS of everything sent to it

HIGHPASS_HZ = 170.0    # 2nd-order Butterworth: -0.7 dB at C4, -3 dB at 170 Hz, -11 dB at 90 Hz
MASTER_RMS = 0.0305    # per-channel RMS of the final mix (about -28 LUFS)
PEAK_CEILING = 0.25


def smooth(value: float) -> float:
    value = max(0.0, min(1.0, value))
    return value * value * (3 - 2 * value)


def note(name: str) -> float:
    """Equal-tempered frequency, A4 = 440 Hz, for names such as "Bb3" or "F#4"."""
    steps = {"C": -9, "D": -7, "E": -5, "F": -4, "G": -2, "A": 0, "B": 2}[name[0]]
    accidental = name[1:-1]
    steps += accidental.count("#") - accidental.count("b")
    octave = int(name[-1])
    return 440.0 * 2 ** ((steps + 12 * (octave - 4)) / 12)


def cents(amount: float) -> float:
    return 2 ** (amount / 1200)


def pan_gains(pan: float) -> tuple[float, float]:
    """Constant-power pan; -1 is left, +1 is right."""
    angle = (max(-1.0, min(1.0, pan)) + 1) * math.pi / 4
    return math.cos(angle), math.sin(angle)


def zeros(length: int) -> array:
    return array("d", bytes(8 * length))


def scaled(values, gain: float):
    return map(mul, values, repeat(gain))


def sine(length: int, frequency: float, phase: float = 0.0):
    return map(math.sin, islice(count(phase, TAU * frequency / RATE), length))


def rms(values) -> float:
    return math.sqrt(math.fsum(map(mul, values, values)) / len(values))


def stereo_rms(left: array, right: array) -> float:
    return math.sqrt((rms(left) ** 2 + rms(right) ** 2) / 2)


def peak(values) -> float:
    return max(map(abs, values))


def add_wrapped(bus: array, signal: array, start: int, gain: float = 1.0) -> None:
    """Add a rendered event into a loop-length bus, wrapping anything past the end."""
    total = len(bus)
    position = start % total
    done = 0
    while done < len(signal):
        span = min(len(signal) - done, total - position)
        piece = scaled(signal[done:done + span], gain)
        bus[position:position + span] = array("d", map(add, bus[position:position + span], piece))
        done += span
        position = 0


def lowpass(values: array, cutoff: float, warm: int = RATE) -> array:
    """Circular one-pole low-pass: the filter state is primed with the loop's own tail."""
    coefficient = 1 - math.exp(-TAU * cutoff / RATE)
    state = 0.0
    for value in values[-warm:]:
        state += coefficient * (value - state)
    step = lambda current, value: current + coefficient * (value - current)
    output = array("d", accumulate(values, step, initial=state))
    return output[1:]


def highpass(values: array, cutoff: float, warm: int = RATE) -> array:
    """Circular 2nd-order Butterworth high-pass, primed with the loop's own tail."""
    omega = TAU * cutoff / RATE
    alpha = math.sin(omega) / math.sqrt(2)
    norm = 1 + alpha
    b0 = (1 + math.cos(omega)) / 2 / norm
    b1 = -2 * b0
    a1 = -2 * math.cos(omega) / norm
    a2 = (1 - alpha) / norm
    x1 = x2 = y1 = y2 = 0.0
    for value in values[-warm:]:
        y1, y2 = b0 * (value + x2) + b1 * x1 - a1 * y1 - a2 * y2, y1
        x1, x2 = value, x1
    output = zeros(len(values))
    for index, value in enumerate(values):
        y1, y2 = b0 * (value + x2) + b1 * x1 - a1 * y1 - a2 * y2, y1
        x1, x2 = value, x1
        output[index] = y1
    return output


# ---------------------------------------------------------------------------
# Pad


def held_notes(pitches: tuple[str, ...]) -> list[tuple[int, int, str]]:
    """Group repeated pitches into held notes, circularly across the loop seam."""
    starts = [index for index in range(len(pitches)) if pitches[index] != pitches[index - 1]]
    if not starts:
        raise ValueError("Each pad voice must move at least once")
    notes = []
    for position, first in enumerate(starts):
        following = starts[(position + 1) % len(starts)]
        if following <= first:
            following += len(pitches)
        notes.append((first, following - 1, pitches[first]))
    return notes


def pad_oscillator(length: int, frequency: float, level: float, rng: random.Random) -> array:
    """One additive oscillator; its partials are already softly low-passed."""
    total = None
    for harmonic, weight in enumerate(PAD_PARTIALS, start=1):
        partial = frequency * harmonic
        gain = level * weight / math.sqrt(1 + (partial / PAD_CUTOFF) ** 2)
        wave_ = scaled(sine(length, partial, rng.uniform(0, TAU)), gain)
        total = array("d", wave_) if total is None else array("d", map(add, total, wave_))
    return total


def pad(rng: random.Random) -> tuple[array, array]:
    """A warm, light sustained pad: five voices, two detuned oscillators each.

    Each held note fades in and out over seven seconds with an equal-power curve,
    so neighbouring chords dissolve into one another without a dip or swell. The
    sharper oscillator leans left and the flatter one leans right; their slow
    beating gives a chorus-like width without any modulation effect.
    """
    left, right = zeros(FRAMES), zeros(FRAMES)
    slot = round(CHORD_SECONDS * RATE)
    fade = round(PAD_FADE_SECONDS * RATE)
    rise = array("d", (math.sin(math.pi / 2 * smooth(index / fade)) for index in range(fade)))
    fall = array("d", reversed(rise))
    for voice, (gain, detune, pan, pitches) in enumerate(VOICES):
        cycles = BREATH_CYCLES[voice]
        breath_phase = rng.uniform(0, TAU)
        for first, last, name in held_notes(pitches):
            start = first * slot - fade // 2
            length = (last - first + 1) * slot + fade
            envelope = rise + array("d", [1.0]) * (length - 2 * fade) + fall
            # A tiny level drift that completes whole cycles per loop.
            step = TAU * cycles / FRAMES
            drift = map(add, repeat(1.0), scaled(map(math.sin, islice(count(breath_phase + step * start, step), length)), BREATH_DEPTH))
            envelope = array("d", map(mul, envelope, drift))
            frequency = note(name)
            sharp = pad_oscillator(length, frequency * cents(detune), 1.0, rng)
            flat = pad_oscillator(length, frequency * cents(-0.62 * detune), 0.74, rng)
            sharp_left, sharp_right = pan_gains(pan - 0.35)
            flat_left, flat_right = pan_gains(pan + 0.35)
            for bus, sharp_gain, flat_gain in ((left, sharp_left, flat_left), (right, sharp_right, flat_right)):
                mixed = array("d", map(mul, map(add, scaled(sharp, sharp_gain), scaled(flat, flat_gain)), envelope))
                add_wrapped(bus, mixed, start, gain)
    return left, right


# ---------------------------------------------------------------------------
# Music box


def chime(frequency: float, velocity: float) -> array:
    """A soft music-box/celesta tone: a near-pure ring with a brief metallic glint.

    Two slightly different fundamentals beat slowly, as a tuned steel tine does;
    the 2nd and 3rd partials and an inharmonic 5.93x partial fade quickly, so
    the attack sparkles and the ring settles into a rounded tone. A 6 ms onset
    keeps it felt rather than struck.
    """
    length = round(CHIME_SECONDS * RATE)
    bright = 0.55 + 0.45 * velocity
    partials = (
        (1.0, 1.0, 1.9),
        (1.0013, 0.32, 1.5),
        (2.0, 0.10 * bright, 0.65),
        (3.01, 0.035 * bright, 0.30),
        (5.93, 0.022 * bright, 0.085),
    )
    total = zeros(length)
    for ratio, weight, decay in partials:
        partial = frequency * ratio
        if partial > 0.42 * RATE:
            continue
        envelope = map(math.exp, islice(count(0.0, -1.0 / (decay * RATE)), length))
        total = array("d", map(add, total, scaled(map(mul, sine(length, partial), envelope), weight)))
    onset = round(0.006 * RATE)
    for index in range(onset):
        total[index] *= smooth(index / onset)
    ending = round(0.8 * RATE)
    for index in range(ending):
        total[length - ending + index] *= 1 - smooth(index / ending)
    return array("d", scaled(total, velocity))


def music_box(rng: random.Random) -> tuple[array, array, array]:
    left, right, send = zeros(FRAMES), zeros(FRAMES), zeros(FRAMES)
    for seconds, name, velocity, pan in MOTIF:
        # A few milliseconds of human looseness, never enough to feel late.
        start = round((seconds + rng.uniform(-0.010, 0.010)) * RATE)
        tone = chime(note(name), velocity * rng.uniform(0.97, 1.03))
        gain_left, gain_right = pan_gains(pan)
        add_wrapped(left, tone, start, gain_left)
        add_wrapped(right, tone, start, gain_right)
        add_wrapped(send, tone, start)
    return left, right, send


# ---------------------------------------------------------------------------
# Space


def comb(values: array, delay: int, feedback: float) -> array:
    """Feedback comb, computed one delay-length block at a time."""
    output = array("d", values[:delay])
    for start in range(delay, len(values), delay):
        end = min(start + delay, len(values))
        output.extend(map(add, values[start:end], scaled(output[start - delay:end - delay], feedback)))
    return output


def allpass(values: array, delay: int, gain: float) -> array:
    """Schroeder all-pass, computed one delay-length block at a time."""
    output = array("d", scaled(values[:delay], -gain))
    for start in range(delay, len(values), delay):
        end = min(start + delay, len(values))
        output.extend(map(add, scaled(values[start:end], -gain),
                          map(add, values[start - delay:end - delay], scaled(output[start - delay:end - delay], gain))))
    return output


def reverb(send: array) -> tuple[array, array]:
    """A soft, dark stereo room (2.8 s decay), rendered circularly.

    The loop's own last twelve seconds are prepended before the combs run and
    discarded afterwards, so the tails at the start of the loop are the real tails
    of its end (the residue of the unprimed start is below -250 dB).
    """
    predelay = round(0.018 * RATE)
    source = lowpass(send[-predelay:] + send[:-predelay], 4200)
    warm = round(REVERB_WARM_SECONDS * RATE)
    extended = source[-warm:] + source
    channels = []
    for side, allpasses in enumerate(REVERB_ALLPASSES):
        wet = zeros(len(extended))
        for delay in REVERB_COMBS:
            delay += side * REVERB_SPREAD
            feedback = 10 ** (-3 * delay / (REVERB_T60 * RATE))
            wet = array("d", map(add, wet, comb(extended, delay, feedback)))
        for delay in allpasses:
            wet = allpass(wet, delay, 0.5)
        channels.append(lowpass(wet[warm:], 2800))
    return channels[0], channels[1]


# ---------------------------------------------------------------------------
# Mix, master and delivery


def windowed_rms_db(left: array, right: array, seconds: float) -> list[float]:
    size = round(seconds * RATE)
    levels = []
    for start in range(0, FRAMES - size + 1, size):
        energy = (math.fsum(map(mul, left[start:start + size], left[start:start + size]))
                  + math.fsum(map(mul, right[start:start + size], right[start:start + size])))
        levels.append(10 * math.log10(energy / (2 * size)))
    return levels


def db(value: float) -> float:
    return 20 * math.log10(value) if value > 0 else float("-inf")


def render() -> tuple[array, array, dict[str, tuple[array, array, float]]]:
    """Mix the layers, high-pass the bus and master it to a fixed RMS.

    The high-pass is applied to each layer (it is linear, so this equals
    filtering the mix), which keeps the per-layer levels exact. Returns the
    master channels and, for analysis, each filtered layer with its final gain.
    """
    began = time.monotonic()
    pad_left, pad_right = pad(random.Random(f"{SEED}:pad"))
    pad_left, pad_right = highpass(pad_left, HIGHPASS_HZ), highpass(pad_right, HIGHPASS_HZ)
    pad_level = stereo_rms(pad_left, pad_right)
    print(f"pad rendered ({time.monotonic() - began:.1f}s)")

    box_left, box_right, box_send = music_box(random.Random(f"{SEED}:motif"))
    box_gain = MOTIF_PEAK * pad_level / max(peak(box_left), peak(box_right))
    send = array("d", map(add, scaled(box_send, box_gain), scaled(map(add, pad_left, pad_right), PAD_SEND / 2)))
    box_left, box_right = highpass(box_left, HIGHPASS_HZ), highpass(box_right, HIGHPASS_HZ)
    print(f"music box rendered ({time.monotonic() - began:.1f}s)")

    wet_left, wet_right = reverb(send)
    wet_left, wet_right = highpass(wet_left, HIGHPASS_HZ), highpass(wet_right, HIGHPASS_HZ)
    wet_gain = REVERB_RATIO * rms(send) / stereo_rms(wet_left, wet_right)
    print(f"reverb rendered ({time.monotonic() - began:.1f}s)")

    layers = {
        "pad": (pad_left, pad_right, 1.0),
        "music box (dry)": (box_left, box_right, box_gain),
        "reverb": (wet_left, wet_right, wet_gain),
    }
    left, right = zeros(FRAMES), zeros(FRAMES)
    for layer_left, layer_right, gain in layers.values():
        left = array("d", map(add, left, scaled(layer_left, gain)))
        right = array("d", map(add, right, scaled(layer_right, gain)))

    master = MASTER_RMS / stereo_rms(left, right)
    left, right = array("d", scaled(left, master)), array("d", scaled(right, master))
    levels = {}
    for name, (layer_left, layer_right, gain) in layers.items():
        level = gain * master
        levels[name] = (layer_left, layer_right, level)
        layer_rms = level * stereo_rms(layer_left, layer_right)
        layer_peak = level * max(peak(layer_left), peak(layer_right))
        print(f"  {name:16s} RMS {db(layer_rms):6.1f} dBFS   peak {db(layer_peak):6.1f} dBFS")
    return left, right, levels


def pcm24(left: array, right: array) -> bytes:
    """Interleaved little-endian 24-bit PCM."""
    full_scale = 8388607
    for channel in (left, right):
        if not all(map(math.isfinite, channel)):
            raise ValueError("Non-finite sample in the mix")
    words = array("i", bytes(4 * 2 * FRAMES))
    words[0::2] = array("i", map(lshift, map(round, scaled(left, full_scale)), repeat(8)))
    words[1::2] = array("i", map(lshift, map(round, scaled(right, full_scale)), repeat(8)))
    if sys.byteorder != "little":
        words.byteswap()
    raw = words.tobytes()
    packed = bytearray(3 * 2 * FRAMES)
    packed[0::3], packed[1::3], packed[2::3] = raw[1::4], raw[2::4], raw[3::4]
    return bytes(packed)


def report(left: array, right: array) -> None:
    level = stereo_rms(left, right)
    top = max(peak(left), peak(right))
    if top > PEAK_CEILING:
        raise ValueError(f"Peak {top:.3f} exceeds the {PEAK_CEILING} ceiling")
    windows = windowed_rms_db(left, right, 3.0)
    steps = [abs(left[index] - left[index - 1]) for index in range(1, FRAMES)]
    seam = max(abs(left[0] - left[-1]), abs(right[0] - right[-1]))
    print(f"{STEM}: {FRAMES / RATE:.2f}s at {RATE} Hz, peak {top:.3f} ({db(top):.1f} dBFS), "
          f"RMS {level:.4f} ({db(level):.1f} dBFS)")
    print(f"  3 s RMS windows: {min(windows):.1f} to {max(windows):.1f} dBFS")
    print(f"  seam step {seam:.5f}; largest step inside the loop {max(steps):.5f}")


def write_wav(path: Path, pcm: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as output:
        output.setnchannels(2)
        output.setsampwidth(3)
        output.setframerate(RATE)
        output.writeframes(pcm)


def ogg_crc(page: bytes) -> int:
    """The Ogg page checksum (CRC-32, polynomial 0x04C11DB7, unreflected)."""
    crc = 0
    for byte in page:
        crc ^= byte << 24
        for _ in range(8):
            crc = ((crc << 1) ^ 0x04C11DB7) if crc & 0x80000000 else crc << 1
            crc &= 0xFFFFFFFF
    return crc


def extend_opus_preskip(stream: bytes, extra: int) -> bytes:
    """Raise an Ogg Opus stream's pre-skip, so decoders discard a lead-in.

    The OpusHead packet sits alone on the first page; its pre-skip is the 16-bit
    field 10 bytes into the packet. Output length is the final granule position
    minus pre-skip, so the end of the stream needs no change.
    """
    segments = stream[26]
    header_end = 27 + segments
    page_end = header_end + sum(stream[27:header_end])
    page = bytearray(stream[:page_end])
    if page[:4] != b"OggS" or page[header_end:header_end + 8] != b"OpusHead":
        raise ValueError("Unexpected Ogg Opus layout")
    field = header_end + 10
    preskip = int.from_bytes(page[field:field + 2], "little") + extra
    if preskip > 0xFFFF:
        raise ValueError("Opus pre-skip is limited to 65535 samples")
    page[field:field + 2] = preskip.to_bytes(2, "little")
    page[22:26] = bytes(4)
    page[22:26] = ogg_crc(bytes(page)).to_bytes(4, "little")
    return bytes(page) + stream[page_end:]


def check_mp4_edit(stream: bytes, lead_in: int, loop: int) -> None:
    """Confirm the MP4 edit list skips the lead-in and presents exactly one loop.

    ffmpeg turns the negative start timestamp into an edit whose media time is
    the AAC priming plus the lead-in. A different ffmpeg that shifted the
    timestamps instead would leave the lead-in audible, so that is refused.
    """
    movie = stream.find(b"mvhd")
    edit = stream.find(b"elst")
    if movie < 0 or edit < 0 or stream[movie + 4] != 0 or stream[edit + 4] != 0:
        raise ValueError("Unexpected MP4 layout: no version-0 movie header and edit list")
    timescale = int.from_bytes(stream[movie + 16:movie + 20], "big")
    entries = int.from_bytes(stream[edit + 8:edit + 12], "big")
    duration = int.from_bytes(stream[edit + 12:edit + 16], "big")
    media_time = int.from_bytes(stream[edit + 16:edit + 20], "big", signed=True)
    if entries != 1 or media_time < lead_in or duration * DELIVERY_RATE != loop * timescale:
        raise ValueError(f"MP4 edit list does not trim the lead-in (media time {media_time}, duration {duration})")


def encode(ffmpeg: str, pcm: bytes, folder: Path) -> None:
    """Encode the loop for the browser, with no edge at either end of the loop.

    ffmpeg receives three back-to-back copies of the loop and resamples them 3:2,
    so the kept audio comes from the resampler's steady state, exactly as it
    would while looping.

    A lossy encoder starting from silence garbles its first few milliseconds (an
    onset from nothing), which would be heard once per loop. Both encodes
    therefore start 200 ms early, with the end of the loop as a lead-in, and the
    container tells decoders to discard it: AAC through the MP4 edit list (from a
    negative start timestamp), Opus by raising the Ogg pre-skip, which RFC 7845
    allows for a cropped start. Each decoder then begins the loop from a settled
    encoder state. The encoders' last frames were already as accurate as the rest
    of the file, so the end needs no extra context.

    AAC runs at 128 kbps: at 112 kbps and below, ffmpeg's encoder produced a
    30 ms error burst on one sustained chord, 30 dB above its usual error. Opus
    uses constrained VBR, because unconstrained VBR spends far more than the
    target on such purely tonal music (about 135 kbps for an 80 kbps target).
    """
    loop = FRAMES * DELIVERY_RATE // RATE
    lead_in = DELIVERY_RATE // 5
    graph = (f"[0:a]aresample={DELIVERY_RATE},atrim=start_sample={loop - lead_in}:end_sample={2 * loop},"
             f"asplit=2[a][b];[a]asetpts=(N-{lead_in})/SR/TB[aac];[b]asetpts=N/SR/TB[opus]")
    exact = ["-map_metadata", "-1", "-fflags", "+bitexact", "-flags:a", "+bitexact"]
    opus = folder / f"{STEM}-lead-in.ogg"
    aac = OUTPUT / f"{STEM}.m4a"
    OUTPUT.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [ffmpeg, "-v", "error", "-y", "-f", "s24le", "-ar", str(RATE), "-ac", "2", "-i", "pipe:0",
         "-filter_complex", graph,
         "-map", "[aac]", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", *exact, str(aac),
         "-map", "[opus]", "-c:a", "libopus", "-b:a", "88k", "-vbr", "constrained", "-application", "audio",
         *exact, str(opus)],
        input=pcm * 3, check=True,
    )
    check_mp4_edit(aac.read_bytes(), lead_in, loop)
    (OUTPUT / f"{STEM}.ogg").write_bytes(extend_opus_preskip(opus.read_bytes(), lead_in))
    for suffix in ("m4a", "ogg"):
        print(f"wrote {(OUTPUT / f'{STEM}.{suffix}').relative_to(ROOT)}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--ffmpeg", default=shutil.which("ffmpeg"), help="ffmpeg executable for the AAC and Opus encodes")
    parser.add_argument("--wav", type=Path, help="also keep the 24-bit master WAV at this path (outside the repository)")
    args = parser.parse_args()
    if not args.ffmpeg:
        parser.error("ffmpeg is required to encode the bed; it is not a site/runtime dependency")

    left, right, _ = render()
    report(left, right)
    pcm = pcm24(left, right)
    with tempfile.TemporaryDirectory() as folder:
        master = args.wav or Path(folder) / f"{STEM}.wav"
        write_wav(master, pcm)
        if args.wav:
            print(f"wrote {master}")
        encode(args.ffmpeg, pcm, Path(folder))


if __name__ == "__main__":
    main()
