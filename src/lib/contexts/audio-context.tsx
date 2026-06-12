"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AudioContextType {
  isMuted: boolean;
  toggleMute: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [isMuted, setIsMuted] = useState(false);

  // Load mute state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("audio-muted");
    if (saved !== null) {
      setIsMuted(saved === "true");
    }
  }, []);

  // Save mute state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("audio-muted", String(isMuted));
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

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
