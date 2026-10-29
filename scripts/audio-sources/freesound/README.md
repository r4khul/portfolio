# Office room source

**Office with Typing.wav**, by **Walter_Odington**, is an office field recording published on Freesound under CC0 1.0. Its source description identifies a London production office. The bank scene uses it as a fictional office/bank interior; it is not presented as a recording made in a bank.

- Recording and license identification: https://freesound.org/people/Walter_Odington/sounds/32380/
- Author: https://freesound.org/people/Walter_Odington/
- CC0: https://creativecommons.org/publicdomain/zero/1.0/
- Public high-quality preview: https://cdn.freesound.org/previews/32/32380_48671-hq.mp3

The preview URL is published in the source page's `data-static-file-url` attribute. The original WAV requires a Freesound login; this source was obtained from the public preview instead.

Only the needed six seconds are retained: `office-with-typing-30s-36s.flac`, source time 30.0–36.0 seconds, downmixed to mono and resampled to 22,050 Hz. No fade or bank-mix processing is baked into this retained excerpt. The generator applies the final fixed filtering, fades, and quiet paperwork/mechanism details.

The retained excerpt was made with:

```sh
ffmpeg -ss 30 -t 6 -i office-preview.mp3 -ac 1 -ar 22050 -c:a flac -compression_level 8 office-with-typing-30s-36s.flac
```

The downloaded public-preview MP3 SHA-256 was `b339152d0dc779210270e37f35d208aafa5cb73f477235ab91064fd15e0d2a70`. The full preview is not included in the repository. `LICENSE.txt` records the source's CC0 designation and provenance.
