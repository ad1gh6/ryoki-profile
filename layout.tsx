'use client';

import { useState, useRef, useEffect, useCallback, createContext, useContext } from 'react';
import { DotGothic16 } from "next/font/google";
import "./globals.css";

const dotGothic = DotGothic16({
  weight: "400",
  subsets: ["latin"],
});

const AppContext = createContext<{
  volume: number;
  setVolume: (v: number) => void;
  isMuted: boolean;
  setIsMuted: (m: boolean) => void;
  showMain: boolean;
  setShowMain: (s: boolean) => void;
  isAnimating: boolean;
  setIsAnimating: (a: boolean) => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  fadeBgm: (fadeOut: boolean) => void;
} | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [volume, setVolume] = useState(0.15);
  const [isMuted, setIsMuted] = useState(false);
  const [showMain, setShowMain] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [bgmFadedOut, setBgmFadedOut] = useState(false);

  // BGMをスムーズにフェードイン/アウトする関数
  const fadeBgm = useCallback((fadeOut: boolean) => {
    if (!audioRef.current) return;
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    setBgmFadedOut(fadeOut);

    const targetVol = fadeOut ? 0 : (isMuted ? 0 : volume);
    const step = 0.01;
    const intervalMs = 30;

    fadeIntervalRef.current = setInterval(() => {
      if (!audioRef.current) return;
      const current = audioRef.current.volume;
      if (fadeOut) {
        const next = Math.max(0, current - step);
        audioRef.current.volume = next;
        if (next <= 0) clearInterval(fadeIntervalRef.current!);
      } else {
        const next = Math.min(targetVol, current + step);
        audioRef.current.volume = next;
        if (next >= targetVol) clearInterval(fadeIntervalRef.current!);
      }
    }, intervalMs);
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current && audioRef.current.readyState >= 2 && !bgmFadedOut) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted, bgmFadedOut]);

  return (
    <html lang="ja">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className="antialiased bg-black text-white">
        <AppContext.Provider value={{ volume, setVolume, isMuted, setIsMuted, showMain, setShowMain, isAnimating, setIsAnimating, audioRef, fadeBgm }}>
          <audio ref={audioRef} src="/bgm.m4a" loop />
          {children}
        </AppContext.Provider>
      </body>
    </html>
  );
}
