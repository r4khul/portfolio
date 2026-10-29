# Retained Casino Audio sources

These four unmodified recordings are from **Casino Audio 1.1** by Kenney Vleugels.

- Official pack: https://kenney.nl/assets/casino-audio
- Kenney's upload: https://opengameart.org/content/54-casino-sound-effects-cards-dice-chips
- License: CC0 1.0; the pack's original `License.txt` is retained beside these files.

`chip-lay-1.ogg`, `chip-lay-2.ogg`, and `chip-lay-3.ogg` supply the three actual chip contacts in the fortune cue. A tightly cropped `card-place-2.ogg` supplies a quiet paper-on-desk accent within the bank's office ambience. The separate office source and its attribution are retained under `../freesound/`.

Regenerate the mono 22,050 Hz WAVs from the repository root with:

```sh
python3 scripts/generate_story_sfx.py
```

Generation needs Python's standard library and ffmpeg. The deployed reader uses the generated WAVs through Web Audio and does not need Python or ffmpeg.
