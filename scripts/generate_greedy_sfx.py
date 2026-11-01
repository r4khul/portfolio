#!/usr/bin/env python3
"""Render Chapter 4's three original, scene-specific sound phrases.

Run ``python3 scripts/generate_greedy_sfx.py``. Only the Python standard library
is needed: no downloads, ffmpeg, recorded music, account, or build-time service.
The mono 22.05 kHz WAV masters are checked in; the browser only decodes and plays
those completed phrases through the shared Web Audio lifecycle.

This chapter is about watching and calculating. Its sounds therefore establish
places and private recognition before allowing the closing score to gather.
The roadside holds only a quiet arriving engine, surveillance holds a few
remembered musical gestures, and opportunity is an original instrumental phrase.
There is no stock
whoosh, repeated UI tick, spoken identification, or borrowed melodic material.
"""

from __future__ import annotations

import math
from pathlib import Path
import struct
import wave


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "sfx" / "stories"
RATE = 22050
TAU = 2 * math.pi


def smooth(value: float) -> float:
    value = max(0.0, min(1.0, value))
    return value * value * (3 - 2 * value)


def silence(duration: float) -> list[float]:
    return [0.0] * round(duration * RATE)


def mix(destination: list[float], source: list[float], start: float, gain: float = 1.0) -> None:
    offset = round(start * RATE)
    for index, value in enumerate(source):
        if offset + index >= len(destination):
            break
        destination[offset + index] += value * gain


def bowed(age: float, frequency: float, attack: float, decay: float = 20) -> float:
    """A rounded original string voice with fixed, individually weighted partials.

    The low-mid harmonics remain audible on laptop/phone speakers. Tiny *fixed*
    offsets between the two voices provide an instrumental body; no pitch sweep,
    noise riser, sub-only impact, or compressed loudness is used to create tension.
    """
    if age <= 0:
        return 0.0
    body = sum(
        weight * math.sin(TAU * frequency * harmonic * age)
        for harmonic, weight in [(1, 1), (2, 0.32), (3, 0.21), (4, 0.10), (5, 0.055)]
    )
    body += 0.10 * math.sin(TAU * (frequency + 0.24) * age + 0.25)
    articulation = smooth(age / attack) * math.exp(-age / decay)
    return body * articulation * (0.975 + 0.025 * math.sin(TAU * 4.7 * age))


def stopped_string(age: float, frequency: float) -> float:
    """A dark short pluck, with no bright electronic ping or escapement attack."""
    if age <= 0:
        return 0.0
    return smooth(age / 0.025) * (
        math.sin(TAU * frequency * age) * math.exp(-age / 0.48)
        + 0.23 * math.sin(TAU * frequency * 2.002 * age) * math.exp(-age / 0.20)
        + 0.085 * math.sin(TAU * frequency * 3.006 * age) * math.exp(-age / 0.10)
    )


def roadside() -> list[float]:
    """One quiet car approaches, settles, and leaves space for the reader.

    The six-second visual phrase retains its .55–1.80s arrival. Audio enters at
    .55s, decelerates smoothly into a short soft idle by 1.80s, then withdraws from
    2.20–2.90s. The remaining timeline is digital silence. No background ambience,
    frying, cookware, insects, road hiss, random excitation or dramatic contact is
    present: the car's arrival is the entire sound, never a noisy location bed.
    """
    samples = silence(6.0)
    phase = 0.0
    # Restrict synthesis to the audible window so the lead-in and tail stay exactly silent.
    for index in range(round(0.55 * RATE), round(2.90 * RATE)):
        time = index / RATE
        # Integrate phase as the engine gently drops in revolutions. Using the
        # instantaneous frequency directly inside sin(f*t) would introduce an
        # unintended sharper pitch bend. This small 104–78Hz change is an engine
        # settling, with no broad-band Doppler/wind sweep or musical chord.
        settling = smooth((time - 0.55) / 1.25)
        frequency = 104.0 - 26.0 * settling
        phase += TAU * frequency / RATE

        # Warm 156–312Hz harmonics carry the quiet car on phone/laptop speakers;
        # low fundamental weight avoids a boomy rumble. A tiny cylinder variation
        # keeps the body organic, without a rattling pulse, tick, hiss or contact.
        engine = (0.55 * math.sin(phase)
                  + 0.68 * math.sin(2 * phase + 0.18)
                  + 0.15 * math.sin(3 * phase + 0.35)
                  + 0.04 * math.sin(4 * phase + 0.10))
        engine *= 0.98 + 0.02 * math.sin(phase / 4)

        # The approaching car gains a little presence, then becomes considerably
        # quieter as it stops. Its idle does not fill all six seconds: a smooth
        # 700ms departure of attention ends at 2.90s without a hard cutoff.
        approach = smooth((time - 0.55) / 0.70)
        idle_level = 1.0 - 0.76 * smooth((time - 1.25) / 0.55)
        quiet_tail = 1.0 - smooth((time - 2.20) / 0.70)
        samples[index] = engine * approach * idle_level * quiet_tail
    return samples


def remembered_tone(duration: float, frequency: float, decay: float = 0.135) -> list[float]:
    """A warm, damped low string gesture, with no percussive or noisy contact.

    The smooth 18ms attack removes the escapement-like snap of a clock. Soft,
    rapidly darkening upper partials give it a muted wooden/string body rather
    than a bright interface ping. Every pitch is fixed; there is no gliding noise,
    mechanical click, surface friction, or background drone. This is an authored
    musical suggestion of recall, never a literal sound of Grahan making notes.
    """
    samples = silence(duration)
    for index in range(len(samples)):
        time = index / RATE
        body = (math.sin(TAU * frequency * time) * math.exp(-time / decay)
                + 0.24 * math.sin(TAU * frequency * 2.003 * time) * math.exp(-time / 0.070)
                + 0.09 * math.sin(TAU * frequency * 3.006 * time) * math.exp(-time / 0.045)
                + 0.05 * math.sin(TAU * (frequency + 0.7) * time) * math.exp(-time / decay))
        envelope = smooth(time / 0.018) * smooth((duration - time) / 0.04)
        samples[index] = body * envelope
    return samples


def surveillance() -> list[float]:
    """Five seconds of a pattern being held and matched entirely in memory.

    Nothing is written down. Three separate low-string gestures accompany the
    remembered arrival hours at .45/1.65/2.85s. The second shifts by a semitone;
    the third returns to the first pitch, as one observation finds its earlier
    match. Their staggered spacing leaves clear silence between thoughts rather
    than making a metronome. At 3.75s the remembered E gains a quiet B above it:
    a brief harmonic agreement, then silence after 4.20s for the prose to resume.
    No pencil, paper, clock tick, UI ping, whoosh, or continuous drone is present.
    """
    samples = silence(5.0)
    for start, length, frequency, gain in [
        (0.45, 0.24, 164.8138, 0.72),
        (1.65, 0.29, 174.6141, 0.68),
        (2.85, 0.21, 164.8138, 0.78),
    ]:
        mix(samples, remembered_tone(length, frequency), start, gain)

    # The final two voices belong to one completed thought and the same 450ms
    # window as the visual alignment. No low bed bridges the earlier pauses, and
    # no musical tail is allowed to suggest ongoing pencil work or clock motion.
    agreement = remembered_tone(0.45, 164.8138, decay=0.22)
    upper = remembered_tone(0.45, 246.9417, decay=0.19)
    for index, value in enumerate(upper):
        agreement[index] += value * 0.34
    mix(samples, agreement, 3.75, 0.56)
    return samples


def opportunity() -> list[float]:
    """A five-second original crime phrase: recognition becoming a private plan.

    Chapter 3 climbed toward a bright watch revelation. This phrase instead closes
    inward over C: E-flat4, D4, then D-flat4 at .40/1.70/3.30s. A low C/G body and
    a late F-sharp upper voice keep those notes from finding a comfortable ending.
    Weight gathers through orchestration and contrary motion, not a jump-scare,
    borrowed soundtrack, watch tick, cymbal riser or generic whoosh. The closing
    550ms cleanly withdraw, leaving the final prose in silence.
    """
    duration = 5.0
    samples = silence(duration)
    for index in range(len(samples)):
        time = index / RATE
        # The lower voices carry audible mid harmonics as well as fundamentals;
        # the ending remains substantial on small speakers without boosting bass.
        foundation = bowed(time, 130.8128, 0.34) * 0.085
        foundation += bowed(time - 0.25, 97.9989, 0.70) * 0.036
        inner = bowed(time - 1.05, 233.0819, 0.80) * 0.025
        # Three separated upper articulations match the recognition and
        # final-link stages of the illustration. The low reflections place the
        # instruments in one small space without blurring the timing accents.
        motif = (stopped_string(time - 0.40, 311.1270) * 0.085
                 + stopped_string(time - 1.70, 293.6648) * 0.095
                 + stopped_string(time - 3.30, 277.1826) * 0.115
                 + stopped_string(time - 0.472, 311.1270) * 0.012
                 + stopped_string(time - 1.772, 293.6648) * 0.014
                 + stopped_string(time - 3.372, 277.1826) * 0.016)
        # A quiet high tritone grows only after the plan's last connection. The
        # bowed D-flat against C gives the late crest its unsettled pressure; no
        # final major/minor chord announces an answer the reader does not have.
        late = bowed(time - 2.65, 369.9944, 0.85) * 0.019
        late += bowed(time - 3.30, 277.1826, 0.55) * 0.042
        growth = 0.61 + 0.39 * smooth(time / 4.2)
        ending = smooth((duration - time) / 0.55)
        samples[index] = (foundation + inner + motif + late) * growth * ending
    return samples


def write(filename: str, samples: list[float], peak: float) -> None:
    """Master once, preserving dynamics; playback uses the shared unity gain.

    PCM endpoints are explicitly zero, finite samples are required, and a single
    normalization establishes predictable headroom. This avoids the earlier
    double attenuation where a quiet file was reduced again by runtime gain.
    Printing RMS alongside peaks exposes a cue that has one loud click but an
    inaudible atmosphere, which peak-only normalization would fail to catch.
    """
    if not samples or not all(math.isfinite(value) for value in samples):
        raise ValueError(f"Invalid samples: {filename}")
    measured = max(abs(value) for value in samples)
    if measured <= 0:
        raise ValueError(f"Silent cue: {filename}")
    pcm = [round(value / measured * peak * 32767) for value in samples]
    # Zero endpoints prevent clicks when Web Audio starts or releases the buffer.
    pcm[0] = pcm[-1] = 0
    if max(abs(value) for value in pcm) >= 32767:
        raise ValueError(f"Clipped cue: {filename}")
    OUTPUT.mkdir(parents=True, exist_ok=True)
    with wave.open(str(OUTPUT / filename), "wb") as output:
        output.setnchannels(1)
        output.setsampwidth(2)
        output.setframerate(RATE)
        output.writeframes(struct.pack(f"<{len(pcm)}h", *pcm))
    rms = math.sqrt(sum((value / 32767) ** 2 for value in pcm) / len(pcm))
    print(f"{filename}: {len(pcm) / RATE:.2f}s, peak {max(abs(value) for value in pcm) / 32767:.3f}, RMS {rms:.4f}")


def main() -> None:
    # The approaching car is deliberately quieter than the memory and ending
    # phrases: it has one small physical job, followed by silence. Other masters
    # retain their existing levels and identical sample data.
    write("roadside-arrival.wav", roadside(), 0.12)
    write("surveillance-memory.wav", surveillance(), 0.30)
    write("opportunity.wav", opportunity(), 0.38)


if __name__ == "__main__":
    main()
