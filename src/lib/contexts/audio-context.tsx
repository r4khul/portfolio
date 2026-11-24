"use client";

import { createContext, useCallback, useContext, useSyncExternalStore, ReactNode } from "react";

interface AudioContextType {
  isMuted: boolean;
  toggleMute: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

// The mute choice lives in localStorage, read through useSyncExternalStore so
// the server and the first client render agree on "not muted" and the saved
// choice takes over right after hydration. The in-memory copy keeps the toggle
// working when storage is blocked, as in some private windows.
const STORAGE_KEY = "audio-muted";
const listeners = new Set<() => void>();
let muted: boolean | null = null;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): boolean {
  if (muted === null) {
    try {
      muted = localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      muted = false;
    }
  }
  return muted;
}

function getServerSnapshot(): boolean {
  return false;
}

function setMuted(next: boolean) {
  muted = next;
  try {
    localStorage.setItem(STORAGE_KEY, String(next));
  } catch {
    // Storage is unavailable; the choice still holds for this visit.
  }
  listeners.forEach((listener) => listener());
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const isMuted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const toggleMute = useCallback(() => setMuted(!getSnapshot()), []);

  return (
    <AudioContext.Provider value={{ isMuted, toggleMute }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudioContext() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error("useAudioContext must be used within an AudioProvider");
  }
  return context;
}
