"use client";

import { useCallback, useEffect, useRef } from "react";
import { useAudioContext } from "@/lib/contexts/audio-context";
import { createMemorySfx, type MemorySfx } from "./memory-sfx";

/**
 * The memory's sound: a quiet music bed under the whole story, and the scene
 * sounds on top of it (memory-sfx.ts). Both run through one master gain, so
 * the site's mute and a hidden tab fade everything together.
 *
 * Browsers only allow sound after the reader touches the page, so the page's
 * audio prompt calls `start` from inside that tap. The bed then loops on the
 * Web Audio clock (the file is seamless) and fades in slowly; the scene
 * sounds follow the story through `sfx`.
 */
const SOURCES = [
  { src: "/sfx/slides/game-console-bed.ogg", type: 'audio/ogg; codecs="opus"' },
  { src: "/sfx/slides/game-console-bed.m4a", type: 'audio/mp4; codecs="mp4a.40.2"' },
];
/** The bed sits well under the scene sounds: felt more than heard. */
const BED_LEVEL = 0.3;
const BED_FADE_IN = 3.2;
const FADE_OUT = 0.9;

type Sound = {
  context: AudioContext;
  master: GainNode;
  bed: GainNode;
  source: AudioBufferSourceNode | null;
  sfx: MemorySfx;
};

function pickSource() {
  const probe = document.createElement("audio");
  return (SOURCES.find(({ type }) => probe.canPlayType(type) === "probably") ?? SOURCES.find(({ type }) => probe.canPlayType(type)) ?? SOURCES[1]).src;
}

/** Codec padding is silence at the very start; loop past it so the seam stays seamless. */
function leadIn(buffer: AudioBuffer) {
  const data = buffer.getChannelData(0);
  const limit = Math.min(data.length, Math.round(buffer.sampleRate * 0.08));
  for (let i = 0; i < limit; i++) if (Math.abs(data[i]) > 0.00003) return i / buffer.sampleRate;
  return 0;
}

const ramp = (gain: GainNode, level: number, seconds: number) => {
  const now = gain.context.currentTime;
  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(gain.gain.value, now);
  gain.gain.linearRampToValueAtTime(level, now + seconds);
};

/** Returns `start` (call it from a trusted gesture) and `sfx`, the scene sounds once started. */
export function useMemorySound() {
  const { isMuted } = useAudioContext();
  const sound = useRef<Sound | null>(null);
  const sfx = useRef<MemorySfx | null>(null);
  const loading = useRef<Promise<AudioBuffer | null> | null>(null);
  const wanted = useRef(false);

  const start = useCallback(() => {
    wanted.current = true;
    if (!sound.current) {
      const Ctor = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      // 24 kHz holds this soft, high-passed bed and every cue without loss,
      // at half the memory of a 48 kHz decode, which matters on small phones.
      let context: AudioContext;
      try {
        context = new Ctor({ latencyHint: "interactive", sampleRate: 24000 });
      } catch {
        context = new Ctor({ latencyHint: "interactive" });
      }
      const master = context.createGain();
      master.gain.value = 1;
      master.connect(context.destination);
      const bed = context.createGain();
      bed.gain.value = 0;
      bed.connect(master);
      sound.current = { context, master, bed, source: null, sfx: createMemorySfx(context, master) };
    }
    const current = sound.current;
    // Resume synchronously, while the browser still counts this as the reader's tap.
    void current.context.resume();
    ramp(current.master, 1, 0.3);
    sfx.current = current.sfx;
    if (!loading.current) {
      loading.current = fetch(pickSource())
        .then((response) => (response.ok ? response.arrayBuffer() : Promise.reject(new Error("bed unavailable"))))
        .then((data) => current.context.decodeAudioData(data))
        .catch(() => {
          loading.current = null;
          return null;
        });
    }
    void loading.current.then((buffer) => {
      if (!buffer || !wanted.current || sound.current !== current) return;
      if (!current.source) {
        const source = current.context.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.loopStart = leadIn(buffer);
        source.loopEnd = buffer.duration;
        source.connect(current.bed);
        source.start(0, source.loopStart);
        current.source = source;
      }
      ramp(current.bed, BED_LEVEL, BED_FADE_IN);
    });
  }, []);

  // Muting anywhere on the site silences everything; the scene sounds stop following.
  useEffect(() => {
    if (!isMuted || !wanted.current) return;
    wanted.current = false;
    sfx.current = null;
    const current = sound.current;
    if (!current) return;
    ramp(current.master, 0, FADE_OUT);
    const timer = window.setTimeout(() => {
      if (!wanted.current && current.context.state === "running") void current.context.suspend();
    }, FADE_OUT * 1000 + 60);
    return () => window.clearTimeout(timer);
  }, [isMuted]);

  // A hidden tab pauses all of it; coming back brings it in again, gently.
  useEffect(() => {
    const visibility = () => {
      const current = sound.current;
      if (!current || !wanted.current) return;
      if (document.hidden) {
        ramp(current.master, 0, 0.3);
        window.setTimeout(() => { if (document.hidden) void current.context.suspend(); }, 360);
      } else {
        void current.context.resume().then(() => ramp(current.master, 1, 1.2));
      }
    };
    document.addEventListener("visibilitychange", visibility);
    return () => document.removeEventListener("visibilitychange", visibility);
  }, []);

  useEffect(() => () => {
    const current = sound.current;
    sound.current = null;
    sfx.current = null;
    wanted.current = false;
    current?.sfx.dispose();
    current?.source?.stop();
    void current?.context.close();
  }, []);

  return { start, sfx };
}
