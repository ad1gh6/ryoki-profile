'use client';

import { useApp } from '../layout';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { DotGothic16 } from "next/font/google";

const dotGothic = DotGothic16({ weight: "400", subsets: ["latin"] });

export default function Playlist() {
  const { volume, setVolume, isMuted, setIsMuted, fadeBgm, pauseBgm, resumeBgm } = useApp();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [spotifyPlaying, setSpotifyPlaying] = useState(false);
  const [iframeKey, setIframeKey] = useState(0); // iframeリロード用キー

  useEffect(() => {
    setMounted(true);
  }, []);

  // Spotifyエリアにタッチ・クリックしたとき、またはボタンを押したときに即座にBGMを停止
  const handleSpotifyAreaInteract = () => {
    setSpotifyPlaying(true);
    pauseBgm(); // スマホでも確実に一時停止
  };

  // Spotify iframe がクリックされた（フォーカスされた）かを検出
  useEffect(() => {
    const handleWindowBlur = () => {
      setSpotifyPlaying(true);
      pauseBgm();
    };

    window.addEventListener('blur', handleWindowBlur);
    return () => {
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [pauseBgm]);

  // BGMに戻す & Spotifyを停止
  const handleResumeBgm = useCallback(() => {
    setSpotifyPlaying(false);
    setIframeKey(prev => prev + 1); // iframeをリロードしてSpotifyを停止
    resumeBgm(); // BGM再開
  }, [resumeBgm]);

  // ページ離脱時
  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    if (spotifyPlaying) {
      fadeBgm(false);
    }
    setIsLeaving(true);
    setTimeout(() => {
      router.push('/');
    }, 400);
  };

  return (
    <main className={`min-h-screen text-white flex flex-col items-center justify-start p-4 sm:p-6 md:p-24 relative overflow-hidden bg-black select-none transition-all duration-[500ms] ease-in-out ${mounted && !isLeaving ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'}`}>

      {/* 背景 */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 via-black to-black z-0" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl z-0" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-500/3 rounded-full blur-3xl z-0" />

      {/* ヘッダー */}
      <div className="w-full max-w-3xl z-10 flex justify-between items-center pb-4 sm:pb-6 mb-4 sm:mb-8 pt-4 sm:pt-6 md:pt-12 relative">
        <button
          onClick={handleBack}
          className={`text-xs text-zinc-400 hover:text-emerald-400 transition-colors flex items-center gap-1 tracking-widest bg-transparent border-none cursor-pointer ${dotGothic.className}`}
        >
          ← BACK TO HOME
        </button>

        {/* 音量コントロール（Spotify再生中は非表示） */}
        {!spotifyPlaying && (
          <div className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-700/50 p-1.5 px-3 rounded-full shadow-lg backdrop-blur-sm h-[34px]">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="hover:scale-110 transition-transform flex items-center justify-center text-zinc-400 hover:text-emerald-400"
            >
              {isMuted ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l-2.25-2.25M19.5 12l-2.25 2.25m-10.5-6L4.5 9H1.5v6h3l4.5 3.75V5.25z" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></svg>
              )}
            </button>
            <input type="range" min={0} max={1} step={0.01} value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="hidden sm:block w-16 h-1 bg-zinc-700 rounded-lg appearance-none accent-emerald-500" />
          </div>
        )}
      </div>

      {/* メインコンテンツ */}
      <div className="w-full max-w-3xl z-10 space-y-4 sm:space-y-8">

        {/* タイトル */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-4 py-1.5 rounded-full">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className={`text-emerald-400 text-[11px] font-bold tracking-widest uppercase ${dotGothic.className}`}>My Playlist</span>
          </div>
          <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold tracking-widest bg-gradient-to-r from-emerald-300 via-green-300 to-emerald-400 bg-clip-text text-transparent filter drop-shadow-[0_0_12px_rgba(16,185,129,0.3)] ${dotGothic.className}`}>
            🎵 Playlist
          </h1>
        </div>

        {/* BGMとSpotifyの切り替えボタン */}
        <div className="flex justify-center">
          {spotifyPlaying ? (
            <button
              onClick={handleResumeBgm}
              className={`inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-5 rounded-full text-xs transition-all duration-300 hover:scale-105 shadow-[0_0_15px_rgba(147,51,234,0.4)] ${dotGothic.className}`}
            >
              🎵 背景BGM を再開する
            </button>
          ) : (
            <button
              onClick={handleSpotifyAreaInteract}
              className={`inline-flex items-center gap-2 bg-zinc-900/80 hover:bg-zinc-800 border border-emerald-500/40 text-emerald-400 font-bold py-2 px-5 rounded-full text-xs transition-all duration-300 hover:scale-105 ${dotGothic.className}`}
            >
              🔇 背景BGM を一時停止してSpotifyを聴く
            </button>
          )}
        </div>

        {/* Spotify Embed */}
        <div className={`text-center text-amber-400 text-[11px] tracking-widest flex items-center justify-center gap-1.5 ${dotGothic.className}`}>
          ⚠️ 音量注意
        </div>
        <div 
          onClick={handleSpotifyAreaInteract}
          onTouchStart={handleSpotifyAreaInteract}
          className="bg-zinc-900/60 backdrop-blur-md border border-emerald-500/20 hover:border-emerald-500/40 rounded-2xl shadow-xl overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]"
        >
          <iframe
            key={iframeKey}
            src="https://open.spotify.com/embed/playlist/1hWrN2nr4RiEHKC0qxvwKl?utm_source=generator&theme=0"
            width="100%"
            height="352"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-2xl sm:h-[552px]"
            style={{ border: 'none' }}
          />
        </div>

        {/* Spotifyで開くボタン */}
        <div className="flex justify-center">
          <a
            href="https://open.spotify.com/playlist/1hWrN2nr4RiEHKC0qxvwKl"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 bg-[#1DB954]/10 hover:bg-[#1DB954] border border-[#1DB954]/30 hover:border-[#1DB954] text-[#1DB954] hover:text-white font-bold py-3 px-8 rounded-full text-xs transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(29,185,84,0.4)] ${dotGothic.className}`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
            Spotify で開く
          </a>
        </div>
      </div>
    </main>
  );
}
