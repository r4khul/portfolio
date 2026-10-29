#!/usr/bin/env python3
"""Render Chapter 3's scene audio from retained sources and original synthesis.

Run ``python3 scripts/generate_story_sfx.py`` from the repository, with ffmpeg on
PATH (or supply --ffmpeg). All source recordings are checked in as short licensed
excerpts, so regeneration needs no network, account, Python package, or audio API.
The website ships only the rendered WAVs and schedules them with Web Audio.

The four cues have different jobs: the rewind is a short internal impact, chips
are close object contacts, the bank is a six-second inhabited interior, and the
watch moves from two exposed ticks into a brief unresolved musical phrase. Times
below are seconds; levels inside each scene are relative to its final peak, set
explicitly in main().
"""

from __future__ import annotations

import argparse
import array
import math
from pathlib import Path
import shutil
import struct
import subprocess
import sys
import wave


ROOT = Path(__file__).resolve().parents[1]
SOURCES = ROOT / "scripts" / "audio-sources" / "kenney"
OFFICE_SOURCE = ROOT / "scripts" / "audio-sources" / "freesound" / "office-with-typing-30s-36s.flac"
OUTPUT = ROOT / "public" / "sfx" / "stories"
RATE = 22050
TAU = 2 * math.pi


def smooth(value: float) -> float:
    value = max(0.0, min(1.0, value))
    return value * value * (3 - 2 * value)


def silence(duration: float) -> list[float]:
    return [0.0] * math.ceil(duration * RATE)


def mix(destination: list[float], source: list[float], start: float, level: float) -> None:
    offset = round(start * RATE)
    for index, value in enumerate(source):
        if offset + index >= len(destination):
            break
        destination[offset + index] += value * level


def contact(ffmpeg: str, filename: str, start: float, end: float) -> list[float]:
    """Keep the actual object contact, removing pre-roll and room-noise tails."""
    result = subprocess.run(
        [ffmpeg, "-v", "error", "-i", str(SOURCES / filename),
         "-f", "f32le", "-ac", "1", "-ar", str(RATE), "pipe:1"],
        check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
    )
    decoded = array.array("f")
    decoded.frombytes(result.stdout)
    if sys.byteorder != "little":
        decoded.byteswap()
    samples = list(decoded[round(start * RATE):round(end * RATE)])
    if not samples:
        raise ValueError(f"Empty source contact: {filename}")
    dc = sum(samples) / len(samples)
    samples = [value - dc for value in samples]
    peak = max(abs(value) for value in samples)
    floor = peak * 0.006
    for index, value in enumerate(samples):
        # The brief contact remains unpitched; there is no added hiss or room bed.
        gate = smooth(abs(value) / floor) if floor else 0.0
        edges = smooth(index / (RATE * 0.001)) * smooth((len(samples) - 1 - index) / (RATE * 0.008))
        samples[index] = value * gate * edges / peak
    return samples


def modes(duration: float, partials: list[tuple[float, float, float]], attack: float = 0.0005) -> list[float]:
    """A short struck mechanism: fixed resonances, never a pitch/noise sweep."""
    samples = silence(duration)
    for index in range(len(samples)):
        time = index / RATE
        onset = smooth(time / attack)
        tail = smooth((duration - time) / 0.006)
        samples[index] = onset * tail * sum(
            weight * math.sin(TAU * frequency * time) * math.exp(-time / decay)
            for frequency, weight, decay in partials
        )
    return samples


def rewind() -> list[float]:
    samples = silence(1.45)
    # A bodily knock and a fixed metallic afterimage. All activity ends by 0.50s.
    # Nothing swells, sweeps, breathes, or repeats.
    mix(samples, modes(0.16, [(108, 1.0, 0.026), (219, 0.42, 0.022), (347, 0.12, 0.013)]), 0.012, 0.8)
    mix(samples, modes(0.46, [(642, 0.8, 0.095), (649, 0.23, 0.085), (1217, 0.10, 0.050)], attack=0.001), 0.025, 0.17)
    return samples


def fortune(ffmpeg: str) -> list[float]:
    samples = silence(1.8)
    # Three real ceramic/plastic chip contacts. The market line rises in silence.
    for filename, trim, start, level in [
        ("chip-lay-1.ogg", (0.043, 0.145), 0.10, 1.0),
        ("chip-lay-2.ogg", (0.079, 0.152), 0.38, 0.85),
        ("chip-lay-3.ogg", (0.087, 0.225), 0.67, 0.95),
    ]:
        mix(samples, contact(ffmpeg, filename, *trim), start, level)
    return samples


def bank(ffmpeg: str) -> list[float]:
    """A small working room, heard from the waiting chairs rather than a close mic.

    The real office/typing recording supplies a continuous sense of occupied space
    and natural distance. It is an office recording used as a fictional bank
    interior, not a claim that the source was recorded in a bank. No synthetic air
    noise, rising sweep, or repeating loop is added. The foreground details remain
    below the room's peak so a paper contact cannot turn the scene into one isolated
    click. The room opens gently, stays present through the bank illustration, then
    recedes; leaving the scene early is handled by the reader's playback controller.
    """
    duration = 6.0
    samples = silence(duration)
    result = subprocess.run(
        [ffmpeg, "-v", "error", "-i", str(OFFICE_SOURCE),
         "-f", "f32le", "-ac", "1", "-ar", str(RATE), "pipe:1"],
        check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
    )
    room = array.array("f")
    room.frombytes(result.stdout)
    if sys.byteorder != "little":
        room.byteswap()
    if len(room) != len(samples):
        raise ValueError("The retained office excerpt must be exactly six seconds")

    # The retained six-second excerpt is source time 30.0–36.0s from Walter
    # Odington's CC0 recording. Its quiet keyboard/desk activity and room reflections
    # establish the interior. No foreground speech or music is layered onto it.
    # Gentle fixed filters remove sub-bass handling rumble and soften the top end;
    # they do not sweep and do not reshape the room into a synthetic whoosh.
    dc = sum(room) / len(room)
    low = 0.0
    softened = 0.0
    high_pass = 1 - math.exp(-TAU * 70 / RATE)
    low_pass = 1 - math.exp(-TAU * 6200 / RATE)
    for index, value in enumerate(room):
        value -= dc
        low += high_pass * (value - low)
        softened += low_pass * (value - low - softened)
        samples[index] = softened

    # First 180ms: enter an already-working room, rather than announcing an effect.
    # Last 650ms: let it withdraw before the narrative continues. The middle has no
    # added swell, gate, repeated noise envelope, or forced beat.
    room_peak = max(abs(value) for value in samples)
    for index, value in enumerate(samples):
        time = index / RATE
        envelope = smooth(time / 0.18) * smooth((duration - time) / 0.65)
        samples[index] = value / room_peak * 0.22 * envelope

    # At 1.90s, a small paper-on-desk contact sits in front of the room. This is the
    # tightly cropped Kenney card placement, mixed at roughly one sixth of the room
    # peak; it suggests forms moving across a counter without overpowering typing.
    mix(samples, contact(ffmpeg, "card-place-2.ogg", 0.183, 0.265), 1.90, 0.035)

    # At 3.30–3.51s, five short original mechanical pulses suggest a distant paper
    # feed. The final low contact at 3.64s settles it. Their low levels leave the
    # recorded room in charge; a tiny delayed reflection gives these added details
    # some distance instead of presenting them as close, isolated interface clicks.
    for index, start in enumerate([3.30, 3.352, 3.404, 3.456, 3.508]):
        feed = modes(0.028, [(176, 0.6, 0.009), (528, 0.24, 0.006), (913, 0.1, 0.004)])
        level = 0.018 + index * 0.0006
        mix(samples, feed, start, level)
        mix(samples, feed, start + 0.019, level * 0.12)
    settle = modes(0.07, [(126, 0.8, 0.017), (583, 0.22, 0.006)])
    mix(samples, settle, 3.64, 0.025)
    return samples


def watch() -> list[float]:
    """Two exposed ticks, then an original three-second mystery composition.

    0.08/0.57s remain the two mechanical contacts shared with the SVG timeline.
    At 0.60s the clue has landed: a low D pedal and two sparse, softly struck tonal
    hints enter underneath its implication. The added score is a short unresolved
    phrase, not a recurring musical loop or an effect imitating wind. Its pitches
    are fixed; only the performance envelope develops. All its sound comes from
    the original additive instrument definitions below, without sampled music,
    random noise, a pitch ramp, or a borrowed composition.
    """
    duration = 3.6
    samples = silence(duration)
    # Two very short escapement contacts, aligned with the SVG at .08s and .57s.
    # No recording, hiss, bell tail, ambience or sustained tone is shared with chips.
    for start, level, pitch in [(0.08, 1.0, 1.0), (0.57, 0.7, 0.87)]:
        tick = modes(0.026, [(1830 * pitch, 0.65, 0.0024), (3110 * pitch, 0.22, 0.0015), (620 * pitch, 0.38, 0.005)], attack=0.00025)
        catch = modes(0.027, [(457 * pitch, 0.5, 0.004), (1270 * pitch, 0.2, 0.002)], attack=0.0003)
        mix(samples, tick, start, level)
        mix(samples, catch, start + 0.006, level * 0.45)

    def felt_note(age: float, frequency: float) -> float:
        """A soft hammer contact with fast-fading, mildly inharmonic overtones."""
        if age <= 0:
            return 0.0
        # The fundamental outlasts its upper partials, giving a rounded felt-like
        # body rather than a bright UI chime. The tiny fixed inharmonicity makes
        # the exposed upper notes less sterile while retaining a stable pitch.
        partials = (
            math.sin(TAU * frequency * age) * math.exp(-age / 0.72)
            + 0.22 * math.sin(TAU * frequency * 2.003 * age) * math.exp(-age / 0.30)
            + 0.075 * math.sin(TAU * frequency * 3.009 * age) * math.exp(-age / 0.16)
        )
        return smooth(age / 0.012) * partials

    # The score occupies exactly 0.60–3.60s. Its lower-middle harmonics carry the
    # pedal on laptop speakers instead of relying on sub-bass. A very small fixed
    # detuning and slow level variation suggest a held/bowed instrument; neither
    # changes pitch or introduces the broad noise texture used by a whoosh.
    music_start = 0.60
    music_duration = 3.0
    pedal = 146.8324  # D3, with audible D4/A4 body in the additive instrument.
    for index in range(round(music_start * RATE), len(samples)):
        time = index / RATE - music_start
        held = (
            math.sin(TAU * pedal * time)
            + 0.38 * math.sin(TAU * pedal * 2.0 * time)
            + 0.17 * math.sin(TAU * pedal * 3.0 * time)
            + 0.07 * math.sin(TAU * pedal * 4.0 * time)
            + 0.09 * math.sin(TAU * (pedal + 0.31) * time + 0.6)
        )
        held *= 0.13 * (0.96 + 0.04 * math.sin(TAU * 0.72 * time))

        # A quiet A-flat against D introduces an unresolved tritone gradually.
        # Two widely spaced A4 / E-flat5 contacts answer it without forming a
        # melodic cadence or a triumphant/jingle-like resolution. Their reflected
        # copies are very low-level tonal tails, not a wash of synthetic air.
        tension = math.sin(TAU * 207.6523 * time) * 0.030 * smooth((time - 0.8) / 0.6)
        notes = (
            felt_note(time - 0.30, 440.0) * 0.085
            + felt_note(time - 1.45, 622.2540) * 0.070
            + felt_note(time - 0.365, 440.0) * 0.010
            + felt_note(time - 1.535, 622.2540) * 0.008
        )

        # A 240ms entry follows the second tick without covering its attack. The
        # slow amplitude-only crescendo is restrained beneath the tick peaks.
        # The final 420ms withdraw decisively to digital silence at 3.60s, leaving
        # the officer's failure to speak as the last dramatic beat.
        entrance = smooth(time / 0.24)
        development = 0.50 + 0.50 * smooth(time / 2.25)
        ending = smooth((music_duration - time) / 0.42)
        samples[index] += (held + tension + notes) * entrance * development * ending
    return samples


def write(filename: str, samples: list[float], peak: float) -> None:
    measured = max(abs(value) for value in samples)
    if measured == 0:
        raise ValueError(f"Silent cue: {filename}")
    pcm = [round(max(-1.0, min(1.0, value / measured * peak)) * 32767) for value in samples]
    OUTPUT.mkdir(parents=True, exist_ok=True)
    with wave.open(str(OUTPUT / filename), "wb") as output:
        output.setnchannels(1)
        output.setsampwidth(2)
        output.setframerate(RATE)
        output.writeframes(struct.pack(f"<{len(pcm)}h", *pcm))
    active = [index for index, value in enumerate(pcm) if value]
    rms = math.sqrt(sum((value / 32767) ** 2 for value in pcm) / len(pcm))
    print(f"{filename}: {len(pcm) / RATE:.3f}s, peak {max(abs(value) for value in pcm) / 32767:.3f}, RMS {rms:.4f}, last contact {active[-1] / RATE:.3f}s")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ffmpeg", default=shutil.which("ffmpeg"), help="ffmpeg executable for decoding the retained OGG sources")
    args = parser.parse_args()
    if not args.ffmpeg:
        parser.error("ffmpeg is required to regenerate the cues; it is not a site/runtime dependency")
    write("rewind.wav", rewind(), 0.18)
    write("fortune.wav", fortune(args.ffmpeg), 0.15)
    write("bank.wav", bank(args.ffmpeg), 0.10)
    write("watch-reveal.wav", watch(), 0.14)


if __name__ == "__main__":
    main()
