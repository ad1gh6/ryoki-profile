'use client';

import { useApp } from '../layout';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DotGothic16 } from "next/font/google";

const dotGothic = DotGothic16({ weight: "400", subsets: ["latin"] });

// 🎂 誕生日から年齢を自動計算する関数 (12月6日生まれ)
function getAoiAge() {
  const today = new Date();
  let age = today.getFullYear() - 2011;
  const m = today.getMonth() + 1;
  const d = today.getDate();
  if (m < 12 || (m === 12 && d < 6)) {
    age--;
  }
  return age;
}

export default function Girlfriend() {
  const { volume, setVolume, isMuted, setIsMuted } = useApp();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [hearts, setHearts] = useState<{ id: number; left: number; delay: number; duration: number; size: number; opacity: number }[]>([]);
  const [daysTogether, setDaysTogether] = useState<number>(1);
  const [monthsTogether, setMonthsTogether] = useState<number>(0);
  const [aoiAge, setAoiAge] = useState<number>(14);

  useEffect(() => {
    setAoiAge(getAoiAge());

    // 記念日: 2026年10月15日
    const startYear = 2026;
    const startMonth = 9; // 10月 (0-indexed)
    const startDay = 15;
    const startDate = new Date(startYear, startMonth, startDay);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1);
    setDaysTogether(diffDays);

    // 毎月15日に1か月ずつ増える計算
    let months = (today.getFullYear() - startYear) * 12 + (today.getMonth() - startMonth);
    if (today.getDate() < startDay) {
      months--;
    }
    setMonthsTogether(Math.max(0, months));

    setHearts(
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 3 + Math.random() * 4,
        size: 10 + Math.random() * 16,
        opacity: 0.15 + Math.random() * 0.3,
      }))
    );
    setMounted(true);
  }, []);

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLeaving(true);
    setTimeout(() => {
      router.push('/');
    }, 400);
  };

  return (
    <main className={`min-h-screen text-white flex flex-col items-center justify-center p-4 sm:p-6 md:p-24 relative overflow-hidden bg-black select-none transition-all duration-[500ms] ease-in-out ${mounted && !isLeaving ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'}`}>

      {/* アニメーション用CSS */}
      <style>{`
        @keyframes float-heart {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-10vh) rotate(45deg); opacity: 0; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(236,72,153,0.2), 0 0 40px rgba(236,72,153,0.1); }
          50% { box-shadow: 0 0 30px rgba(236,72,153,0.4), 0 0 60px rgba(236,72,153,0.2); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
        .animate-shimmer {
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
        }
      `}</style>

      {/* 降ってくるハートパーティクル */}
      {hearts.map((h) => (
        <div
          key={h.id}
          className="fixed pointer-events-none z-0 text-pink-400"
          style={{
            left: `${h.left}%`,
            fontSize: `${h.size}px`,
            opacity: h.opacity,
            animation: `float-heart ${h.duration}s ${h.delay}s ease-in infinite`,
          }}
        >
          ♥
        </div>
      ))}

      {/* 背景グラデーション */}
      <div className="absolute inset-0 bg-gradient-to-b from-pink-950/20 via-black to-black z-0" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-pink-500/5 rounded-full blur-3xl z-0" />

      {/* ヘッダー */}
      <div className="w-full max-w-2xl z-10 flex justify-between items-center pb-4 sm:pb-6 mb-4 sm:mb-8 relative">
        <button
          onClick={handleBack}
          className={`text-xs text-zinc-400 hover:text-pink-400 transition-colors flex items-center gap-1 tracking-widest bg-transparent border-none cursor-pointer ${dotGothic.className}`}
        >
          ← BACK TO HOME
        </button>

        {/* 音量コントロール */}
        <div className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-700/50 p-1.5 px-3 rounded-full shadow-lg backdrop-blur-sm h-[34px]">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="hover:scale-110 transition-transform flex items-center justify-center text-zinc-400 hover:text-pink-400"
          >
            {isMuted ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l-2.25-2.25M19.5 12l-2.25 2.25m-10.5-6L4.5 9H1.5v6h3l4.5 3.75V5.25z" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></svg>
            )}
          </button>
          <input type="range" min={0} max={1} step={0.01} value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="hidden sm:block w-16 h-1 bg-zinc-700 rounded-lg appearance-none accent-pink-500" />
        </div>
      </div>

      {/* メインカード */}
      <div className="w-full max-w-2xl z-10 space-y-4 sm:space-y-6">

        {/* タイトル */}
        <div className="text-center space-y-2">
          <p className={`text-pink-400/80 text-xs tracking-[0.3em] uppercase ${dotGothic.className}`}>♥ My Girlfriend ♥</p>
          <h1 className={`text-3xl sm:text-5xl md:text-6xl font-bold tracking-widest bg-gradient-to-r from-pink-300 via-rose-300 to-pink-400 bg-clip-text text-transparent filter drop-shadow-[0_0_12px_rgba(236,72,153,0.3)] ${dotGothic.className}`}>
            あおい
          </h1>

        </div>

        {/* プロフィールカード */}
        <div className="bg-zinc-900/60 backdrop-blur-md border border-pink-500/20 hover:border-pink-500/40 p-5 sm:p-8 rounded-2xl shadow-xl animate-pulse-glow transition-all duration-500 space-y-4 sm:space-y-6">

          {/* アバター & 名前 */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 p-[3px] shadow-[0_0_30px_rgba(236,72,153,0.3)]">
                <div className="w-full h-full rounded-full bg-cover bg-center border-2 border-zinc-950" style={{ backgroundImage: "url('/aoi.jpg')" }} />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-pink-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-lg">
                💕 GF
              </div>
            </div>
            <div className="text-center">
              <h2 className={`text-2xl font-bold text-white tracking-wider ${dotGothic.className}`}>あおい</h2>
              <span className="inline-block border border-pink-500/50 text-pink-400 bg-pink-950/30 text-[10px] px-3 py-0.5 rounded-full font-mono font-semibold mt-2">
                ♥ Girlfriend ♥
              </span>
            </div>
          </div>

          {/* 💕 記念日カウンター */}
          <div className="flex justify-center">
            <div className={`flex flex-col items-center justify-center py-2.5 px-6 rounded-2xl bg-gradient-to-r from-pink-500/10 via-rose-500/15 to-pink-500/10 border border-pink-400/30 shadow-[0_0_15px_rgba(244,114,182,0.15)] ${dotGothic.className}`}>
              <div className="flex items-center gap-1.5 text-[10px] text-pink-300/80 tracking-widest font-mono">
                <span>SINCE</span>
                <span className="font-bold text-pink-200">2026.10.15</span>
              </div>
              
              {monthsTogether >= 1 ? (
                // 11月15日以降：1か月記念、2か月記念、3か月記念...
                <div className="flex flex-col items-center mt-0.5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-bold text-pink-200 tracking-wider filter drop-shadow-[0_0_8px_rgba(244,114,182,0.5)]">
                      {monthsTogether}か月記念
                    </span>
                    <span className="text-sm text-pink-300">💕</span>
                  </div>
                  <span className="text-[10px] text-pink-300/70 font-mono mt-0.5">({daysTogether}日目)</span>
                </div>
              ) : (
                // 11月15日を迎えるまで
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xs text-pink-300">付き合って</span>
                  <span className="text-2xl sm:text-3xl font-bold text-pink-200 tracking-wider filter drop-shadow-[0_0_8px_rgba(244,114,182,0.5)]">
                    {daysTogether}
                  </span>
                  <span className="text-xs text-pink-300">日目 💕</span>
                </div>
              )}
            </div>
          </div>

          {/* 区切り線 */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-pink-500/30 to-transparent" />
            <span className="text-pink-500/50 text-xs">♥</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-pink-500/30 to-transparent" />
          </div>

          {/* メッセージ */}
          <div className={`text-center space-y-3 ${dotGothic.className}`}>
            <p className="text-zinc-400 text-xs uppercase tracking-wider">About Her</p>
            <p className="text-zinc-200 text-sm leading-relaxed">
              うんこ
            </p>
          </div>

          {/* ステータスバッジ */}
          <div className={`flex flex-wrap gap-2 justify-center ${dotGothic.className}`}>
            <span className="bg-pink-950/40 border border-pink-500/30 px-3 py-1.5 rounded-xl text-xs text-pink-300 flex items-center gap-1.5 hover:border-pink-400/60 transition-colors duration-300">
              {aoiAge}y/o
            </span>
            <span className="bg-pink-950/40 border border-pink-500/30 px-3 py-1.5 rounded-xl text-xs text-pink-300 flex items-center gap-1.5 hover:border-pink-400/60 transition-colors duration-300">
              Japan
            </span>
            <span className="bg-pink-950/40 border border-pink-500/30 px-3 py-1.5 rounded-xl text-xs text-pink-300 flex items-center gap-1.5 hover:border-pink-400/60 transition-colors duration-300">
              Women
            </span>
          </div>

          {/* TikTokリンク */}
          <div className="pt-2">
            <a
              href="https://www.tiktok.com/@r1nyao"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-zinc-900/40 hover:bg-white border border-zinc-700 hover:border-white text-zinc-300 hover:text-black font-bold py-2.5 px-2 rounded-xl text-xs transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_15px_rgba(255,255,255,0.4)] group text-center"
            >
              🎥 TikTok
            </a>
          </div>
        </div>

        {/* フッター */}

      </div>
    </main>
  );
}
