# Chapter 3 sound credits

The fortune cue uses trimmed and mixed `chip-lay-1.ogg`, `chip-lay-2.ogg`, and `chip-lay-3.ogg` recordings from **Casino Audio 1.1**, by **Kenney Vleugels / Kenney.nl**, released under **Creative Commons Zero (CC0 1.0)**.

The bank cue uses the 30.0–36.0 second excerpt of **Office with Typing.wav**, by **Walter_Odington**, released on Freesound under **CC0 1.0**. This is an office field recording used to suggest the fictional bank's working interior. The six-second mono source excerpt is retained as FLAC under `scripts/audio-sources/freesound/`. The mix uses fixed rumble/top-end filtering and short fades, a quiet `card-place-2.ogg` paper contact from Kenney, and original distant mechanical pulses. The printer-like detail is synthesis, not a separate printer recording.

- Office recording: https://freesound.org/people/Walter_Odington/sounds/32380/
- Author: https://freesound.org/people/Walter_Odington/
- License: https://creativecommons.org/publicdomain/zero/1.0/

- Source: https://kenney.nl/assets/casino-audio
- Author's upload: https://opengameart.org/content/54-casino-sound-effects-cards-dice-chips
- License: https://creativecommons.org/publicdomain/zero/1.0/

The rewind impact/ring and watch escapement contacts are original synthesis, without borrowed recordings. The watch reveal (`watch-reveal.wav`) also contains an original three-second mystery composition, beginning at 0.60 seconds after the two ticks: a fixed D3 resonant/bowed-like pedal, a quiet unresolved A-flat tension, and sparse A4 / E-flat5 felt-like tonal contacts. The instruments and composition are synthesized directly by `scripts/generate_story_sfx.py`; no recorded music, third-party melody, noise bed, or pitch-sweep effect is used. The phrase ends at 3.60 seconds with a short clean fade.

All generation, trimming, and mixing steps are retained in `scripts/generate_story_sfx.py`; source excerpts, original Kenney OGGs, and their provenance/license notices are retained under `scripts/audio-sources/`.
