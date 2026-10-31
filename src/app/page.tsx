'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useApp } from './layout';
import { DotGothic16 } from "next/font/google";

const dotGothic = DotGothic16({ weight: "400", subsets: ["latin"] });

// 🟢 コピーしたあなたのDiscordのユーザーID
const DISCORD_USER_ID = "1250821001680392202"; 

// TypeScript用の型定義
interface DiscordUser {
  id: string;
  username: string;
  avatar: string;
  global_name?: string | null;
}

interface Activity {
  type: number;
  name: string;
}

interface SpotifyData {
  track_id: string;
  song: string;
  artist: string;
  album_art_url: string;
  album: string;
}

interface LanyardData {
  discord_user: DiscordUser;
  discord_status: 'online' | 'idle' | 'dnd' | 'offline';
  activities: Activity[];
  listening_to_spotify: boolean;
  spotify: SpotifyData | null;
}

export default function Home() {
  const { volume, setVolume, isMuted, setIsMuted, showMain, setShowMain, audioRef } = useApp();
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLeavingToHome, setIsLeavingToHome] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // --- Lanyard API から Discord のリアルタイムステータスを取得するロジック ---
  const [discordData, setDiscordData] = useState<LanyardData | null>(null);

  useEffect(() => {
    if (!DISCORD_USER_ID) return;

    const fetchDiscordStatus = async () => {
      try {
        const res = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`);
        const json = await res.json();
        if (json.success) {
          setDiscordData(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch Discord status:", error);
      }
    };

    fetchDiscordStatus();
    // 15秒ごとにステータスを自動更新
    const interval = setInterval(fetchDiscordStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  // --- 💡 3D カード傾斜 (Tilt) エフェクト用のマウス座標ステート ---
  const [discordTilt, setDiscordTilt] = useState({ x: 0, y: 0 });
  const [introTilt, setIntroTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, setTilt: Function) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const maxTilt = 10; // 最大の傾き角度（度）
    setTilt({
      x: -(y / (rect.height / 2)) * maxTilt,
      y: (x / (rect.width / 2)) * maxTilt
    });
  };

  const handleMouseLeave = (setTilt: Function) => {
    setTilt({ x: 0, y: 0 });
  };

  // ステータスに応じたデザイン設定
  const getStatusConfig = (status: 'online' | 'idle' | 'dnd' | 'offline') => {
    switch (status) {
      case 'online':
        return {
          dotClass: 'bg-green-500 shadow-[0_0_10px_#22c55e]',
          text: 'ONLINE',
          textClass: 'text-green-400',
          emoji: '🟢'
        };
      case 'idle':
        return {
          dotClass: 'bg-amber-500 shadow-[0_0_10px_#f59e0b]',
          text: 'IDLE (退席中)',
          textClass: 'text-amber-400',
          emoji: '🌙'
        };
      case 'dnd':
        return {
          dotClass: 'bg-red-500 shadow-[0_0_10px_#ef4444]',
          text: 'DO NOT DISTURB (取り込み中)',
          textClass: 'text-red-400',
          emoji: '🔴'
        };
      case 'offline':
      default:
        return {
          dotClass: 'bg-zinc-500 shadow-[0_0_10px_#71717a]',
          text: 'OFFLINE',
          textClass: 'text-zinc-500',
          emoji: '⚫'
        };
    }
  };

  const currentStatus = discordData?.discord_status || 'offline';
  const statusConfig = getStatusConfig(currentStatus);

  // プレイ中のゲームアクティビティを取得 (type 0 が「〜をプレイ中」)
  const gameActivity = discordData?.activities?.find((act: Activity) => act.type === 0);

  // 動的アバターURLの生成
  const avatarUrl = discordData?.discord_user?.avatar
    ? `https://cdn.discordapp.com/avatars/${discordData.discord_user.id}/${discordData.discord_user.avatar}.${discordData.discord_user.avatar.startsWith('a_') ? 'gif' : 'png'}`
    : 'https://cdn.discordapp.com/embed/avatars/0.png';

  const handleEnterSite = () => {
    // 映像と音声を先頭にリセットして同期スタート
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play()
        .then(() => { setIsAnimating(true); setTimeout(() => setShowMain(true), 800); })
        .catch(() => { setIsAnimating(true); setTimeout(() => setShowMain(true), 800); });
    }
  };

const FAVORITE_GAMES = [
  {
    name: 'Fortnite',
    color: 'from-blue-600/10 to-cyan-500/10 hover:from-blue-500 hover:to-cyan-400 border-cyan-500/30 hover:border-cyan-400 hover:text-white',
    glow: 'hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]',
    iconUrl: 'https://cdn.simpleicons.org/fortnite/00b4ff'
  },
  {
    name: 'APEX Legends',
    color: 'from-red-600/10 to-rose-500/10 hover:from-red-600 hover:to-rose-500 border-rose-500/30 hover:border-rose-400 hover:text-white',
    glow: 'hover:shadow-[0_0_15px_rgba(244,63,94,0.4)]',
    iconUrl: 'predoter.png'
  },
  {
    name: 'Valorant',
    color: 'from-rose-700/10 to-red-500/10 hover:from-rose-700 hover:to-red-500 border-rose-500/30 hover:border-rose-400 hover:text-white',
    glow: 'hover:shadow-[0_0_15px_rgba(244,63,94,0.4)]',
    iconUrl: 'https://cdn.simpleicons.org/valorant/ff4646'
  },
  {
    name: 'R.E.P.O.',
    color: 'from-amber-600/10 to-yellow-500/10 hover:from-amber-600 hover:to-yellow-500 border-amber-500/30 hover:border-amber-400 hover:text-white',
    glow: 'hover:shadow-[0_0_15px_rgba(245,158,11,0.4)]',
    iconUrl: ''
  },
  {
    name: 'Minecraft',
    color: 'from-emerald-600/10 to-green-500/10 hover:from-emerald-600 hover:to-green-500 border-green-500/30 hover:border-green-400 hover:text-white',
    glow: 'hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]',
    iconUrl: 'https://cdn.simpleicons.org/minecraft/00b4ff'
  },
  {
    name: 'Roblox',
    color: 'from-zinc-600/10 to-stone-500/10 hover:from-zinc-600 hover:to-stone-500 border-stone-500/30 hover:border-stone-400 hover:text-white',
    glow: 'hover:shadow-[0_0_15px_rgba(120,113,108,0.4)]',
    iconUrl: ''
  }
];
  return (
    <main className="min-h-screen text-white flex flex-col items-center justify-center relative overflow-hidden bg-black select-none">
      {/* 🎵 アニメーション用キーフレームCSSの埋め込み */}
      <style>{`
        @keyframes vinyl-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spotify-wave {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1); }
        }
        .animate-vinyl {
          animation: vinyl-spin 8s linear infinite;
        }
        .spotify-bar-1 { animation: spotify-wave 0.8s ease-in-out infinite alternate; }
        .spotify-bar-2 { animation: spotify-wave 0.5s ease-in-out infinite alternate; }
        .spotify-bar-3 { animation: spotify-wave 0.7s ease-in-out infinite alternate; }
        .spotify-bar-4 { animation: spotify-wave 0.6s ease-in-out infinite alternate; }
      `}</style>

      {/* 画面上部のナビゲーション（メイン画面に入ってからのみ表示） */}
      {showMain && (
      <div className="absolute top-0 left-0 w-full z-40 px-3 py-2 sm:px-4 sm:py-3 flex flex-wrap items-center justify-between gap-2 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center min-h-[34px]">
            <button onClick={() => { setIsLeavingToHome(true); setTimeout(() => { setShowMain(false); setIsLeavingToHome(false); setIsAnimating(false); }, 400); }} className={`text-[10px] sm:text-xs text-zinc-400 hover:text-purple-400 flex items-center gap-1 ${dotGothic.className} tracking-widest bg-transparent border-none transition-colors`}>
              ← BACK
            </button>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3 ml-auto flex-wrap justify-end">
          <Link href="/girlfriend" className={`bg-pink-600 hover:bg-pink-500 text-white font-bold py-1 px-2.5 sm:py-1.5 sm:px-4 rounded-full text-[10px] sm:text-xs transition-all duration-300 hover:scale-105 shadow-[0_0_10px_rgba(236,72,153,0.3)] whitespace-nowrap ${dotGothic.className}`}>Girlfriend 💕</Link>
          <Link href="/playlist" className={`bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1 px-2.5 sm:py-1.5 sm:px-4 rounded-full text-[10px] sm:text-xs transition-all duration-300 hover:scale-105 shadow-[0_0_10px_rgba(16,185,129,0.3)] whitespace-nowrap ${dotGothic.className}`}>Playlist 🎵</Link>
          <div id="music-controls" className="flex items-center gap-1.5 sm:gap-2 bg-zinc-900/80 border border-zinc-700/50 p-1 px-2 sm:p-1.5 sm:px-3 rounded-full shadow-lg backdrop-blur-sm h-[30px] sm:h-[34px]">
            <button onClick={() => setIsMuted(!isMuted)} className="hover:scale-110 transition-transform flex items-center justify-center text-zinc-400 hover:text-purple-400">
              {isMuted ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 sm:w-4 sm:h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l-2.25-2.25M19.5 12l-2.25 2.25m-10.5-6L4.5 9H1.5v6h3l4.5 3.75V5.25z" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 sm:w-4 sm:h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></svg>
              )}
            </button>
            <input type="range" min={0} max={1} step={0.01} value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="hidden sm:block w-16 h-1 bg-zinc-700 rounded-lg appearance-none accent-purple-500" />
          </div>
        </div>
      </div>
      )}

      {!showMain && (
        <div onClick={handleEnterSite} className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black overflow-hidden transition-all duration-[800ms] ease-in-out">
          <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-80 pointer-events-none" src="/bg-video.mp4" />
          <div className="absolute inset-0 bg-black/30 z-[1]" />
          <h1 className={`text-3xl sm:text-4xl font-bold tracking-widest z-10 select-none text-center px-4 bg-gradient-to-r from-pink-300 via-fuchsia-300 to-purple-300 bg-clip-text text-transparent filter drop-shadow-[0_0_8px_rgba(244,63,94,0.2)] ${dotGothic.className}`}>りょーき</h1>
          <p className={`text-[10px] text-zinc-400 font-mono tracking-widest animate-bounce mt-4 z-10 opacity-70 ${dotGothic.className}`}>PRESS START TO ENTER.</p>
        </div>
      )}
      <div className={`w-full min-h-screen flex flex-col items-center justify-center p-3 pt-20 sm:p-4 sm:pt-24 md:p-24 md:pt-32 relative transition-all duration-[400ms] ease-in-out ${showMain && !isLeavingToHome ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <video ref={videoRef} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none z-0" src="/bg-video.mp4" />
        <div className="absolute inset-0 bg-black/50 z-[1]" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 max-w-7xl w-full z-10 items-start">
          <div className="flex flex-col justify-center items-center space-y-6 text-center w-full pt-6 md:pt-20">
            <div className="w-full flex flex-col items-center justify-center">
              <p className={`text-zinc-400 text-sm tracking-widest uppercase ${dotGothic.className}`}>HI THERE, I'M</p>
              <h1 className={`text-4xl sm:text-5xl md:text-6xl font-bold tracking-widest select-none mt-2 bg-gradient-to-r from-zinc-100 via-pink-100 to-purple-200 bg-clip-text text-transparent filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] drop-shadow-[0_4px_12px_rgba(251,207,232,0.2)] text-center w-full ${dotGothic.className}`}>りょーき</h1>
            </div>
            <div className={`flex flex-wrap gap-2 justify-center w-full ${dotGothic.className}`}>
              <span className="bg-zinc-800/80 border border-zinc-700 px-3 py-1 rounded-full text-xs font-semibold">16 y/o</span>
              <span className="bg-zinc-800/80 border border-zinc-700 px-3 py-1 rounded-full text-xs font-semibold">Japan</span>
              <span className="bg-zinc-800/80 border border-zinc-700 px-3 py-1 rounded-full text-xs font-semibold">Gamer</span>
              <span className="bg-zinc-800/80 border border-zinc-700 px-3 py-1 rounded-full text-xs font-semibold">Men</span>
            </div>
          </div>

          {/* 右側：コンテンツエリア */}
          <div className="w-full max-w-xl mx-auto md:mr-0 space-y-4 flex flex-col">
            
            {/* 🟢 リアルタイムで連動するDiscordステータス表示枠 (3Dチルト付き) */}
            <div 
              onMouseMove={(e) => handleMouseMove(e, setDiscordTilt)}
              onMouseLeave={() => handleMouseLeave(setDiscordTilt)}
              style={{
                transform: `perspective(1000px) rotateX(${discordTilt.x}deg) rotateY(${discordTilt.y}deg)`,
                transition: 'transform 0.15s ease-out, border-color 0.3s ease, box-shadow 0.3s ease',
              }}
              className="w-full bg-zinc-900/40 border border-zinc-800/50 hover:border-purple-500/30 p-3 sm:p-4 rounded-xl flex items-center justify-between shadow-2xl relative overflow-hidden backdrop-blur-md hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] cursor-default"
            >
              <div className="flex items-center gap-3 sm:gap-4 z-10">
                {/* 動的アバターとステータスランプ */}
                <div className="relative flex-shrink-0">
                  <img src={avatarUrl} alt="Discord Avatar" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-zinc-800 shadow-md object-cover animate-fade-in" />
                  <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-zinc-950 transition-all duration-500 ${statusConfig.dotClass}`} />
                </div>

                {/* ユーザーネームと動的ステータスメッセージ */}
                <div className="text-left font-sans">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm sm:text-base tracking-wide">
                      {discordData?.discord_user?.global_name || "りょーき"}
                    </span>
                    <span className="text-[10px] sm:text-xs text-zinc-500 font-medium font-mono hidden sm:inline">
                      [{discordData?.discord_user?.username || "c_love"}]
                    </span>
                  </div>
                  
                  {/* ゲームをプレイ中の場合はゲーム名を表示、そうでない場合は固定の一言を表示 */}
                  {gameActivity && (
                    <p className="text-purple-300 text-xs mt-0.5 font-bold truncate max-w-[240px] animate-pulse">
                      🎮 {gameActivity.name} をプレイ中
                    </p>
                  )}
                  
                  <p className={`text-[10px] sm:text-[11px] ${statusConfig.textClass} mt-1 font-semibold flex items-center gap-1`}>
                    <span>{statusConfig.emoji} Status:</span> <span className="font-bold">{statusConfig.text}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* 🟢 Spotify リアルタイム再生中カード (Spotifyで曲を聴いている時だけ自動表示されます) */}
            {discordData?.listening_to_spotify && discordData.spotify && (
              <div className="w-full bg-zinc-950/80 border border-emerald-500/30 p-4 rounded-xl flex items-center justify-between shadow-[0_0_20px_rgba(16,185,129,0.15)] relative overflow-hidden backdrop-blur-md transition-all duration-500 hover:border-emerald-500/60 group animate-fade-in">
                {/* 背景にスワールするエメラルド色の光 */}
                <div className="absolute -right-10 -bottom-10 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500" />
                
                <div className="flex items-center gap-4 z-10 w-full">
                  {/* 回転するレコード風アルバムアート */}
                  <div className="relative flex-shrink-0">
                    <img 
                      src={discordData.spotify.album_art_url} 
                      alt="Spotify Album Art" 
                      className="w-14 h-14 rounded-full border border-emerald-500/20 shadow-md object-cover animate-vinyl" 
                    />
                    {/* レコードの中心の穴 */}
                    <div className="absolute inset-0 m-auto w-3 h-3 rounded-full bg-zinc-950 border border-zinc-800" />
                  </div>

                  {/* 曲の情報 */}
                  <div className="text-left font-sans flex-1 min-w-0">
                    <p className="text-[9px] text-emerald-400 font-bold tracking-wider flex items-center gap-1 uppercase">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      Listening on Spotify
                    </p>
                    <h4 className="font-bold text-white text-xs sm:text-sm mt-0.5 truncate group-hover:text-emerald-300 transition-colors">
                      {discordData.spotify.song}
                    </h4>
                    <p className="text-zinc-400 text-[11px] truncate">
                      by {discordData.spotify.artist}
                    </p>
                  </div>

                  {/* イコライザー(音楽波形)アニメーション */}
                  <div className="flex items-end gap-[3px] h-4 pr-1 flex-shrink-0">
                    <div className="w-[3px] h-3 bg-emerald-500 rounded-full spotify-bar-1" />
                    <div className="w-[3px] h-4 bg-emerald-500 rounded-full spotify-bar-2" />
                    <div className="w-[3px] h-2 bg-emerald-500 rounded-full spotify-bar-3" />
                    <div className="w-[3px] h-3.5 bg-emerald-500 rounded-full spotify-bar-4" />
                  </div>
                </div>
              </div>
            )}

            {/* 本体の自己紹介カード (3Dチルト付き) */}
            <div 
              onMouseMove={(e) => handleMouseMove(e, setIntroTilt)}
              onMouseLeave={() => handleMouseLeave(setIntroTilt)}
              style={{
                transform: `perspective(1000px) rotateX(${introTilt.x}deg) rotateY(${introTilt.y}deg)`,
                transition: 'transform 0.15s ease-out, border-color 0.3s ease, box-shadow 0.3s ease',
              }}
              className="bg-zinc-900/60 backdrop-blur-md border border-zinc-800/50 hover:border-purple-500/20 p-4 sm:p-6 rounded-2xl shadow-xl space-y-4 sm:space-y-6 w-full cursor-default hover:shadow-[0_0_25px_rgba(168,85,247,0.1)]"
            >
              <div className={dotGothic.className}>
                <p className="text-zinc-400 text-xs">Age (年齢): <span className="text-white text-sm font-semibold">16</span></p>
                <p className="text-zinc-400 text-xs mt-1">From (出身): <span className="text-white text-sm font-semibold">Japan</span></p>
              </div>
              
              {/* 趣味セクション：スタイリッシュなタグに変更 */}
              <div className={dotGothic.className}>
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Hobby (趣味):</h3>
                <div className="flex gap-2">
                  <span className="bg-zinc-800/80 border border-zinc-700/50 px-3 py-1.5 rounded-xl text-xs text-zinc-300 flex items-center gap-1.5 hover:border-purple-500/50 transition-colors duration-300">
                    🎮 Game
                  </span>
                  <span className="bg-zinc-800/80 border border-zinc-700/50 px-3 py-1.5 rounded-xl text-xs text-zinc-300 flex items-center gap-1.5 hover:border-pink-500/50 transition-colors duration-300">
                    🎵 Music
                  </span>
                </div>
              </div>

              {/* ゲームセクション：ネオンのように輝くバッジグリッドにアップグレード */}
                              <div className="grid grid-cols-2 gap-2 mt-2">
          {FAVORITE_GAMES.map((game, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-center bg-gradient-to-r ${game.color} border px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 hover:scale-[1.03] text-zinc-300 cursor-default ${game.glow}`}
            >
              <span>{game.name}</span>
            </div>
          ))}
        </div>


                      {/* メッセージセクション */}
        <div className={dotGothic.className}>
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">MESSAGE (一言コメント):</h3>
          <p className="text-zinc-300 text-sm whitespace-pre-line leading-relaxed">
            彼女います。女いりません
          </p>
        </div>
              
              {/* ソーシャル＆リンクエリア：3カラムのプレミアムグリッドに変更 */}
              <div className={`pt-4 border-t border-zinc-800 space-y-3 ${dotGothic.className}`}>
                <p className="text-zinc-400 text-xs uppercase tracking-wider font-semibold">Social & Links (SNS・連絡先):</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Discordフレンド追加・メッセージ */}
                  <a href="https://discord.com/users/1250821001680392202" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-[#5865F2]/10 hover:bg-[#5865F2] border border-[#5865F2]/30 hover:border-[#5865F2] text-[#5865F2] hover:text-white font-bold py-2.5 px-2 rounded-xl text-xs transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_15px_rgba(88,101,242,0.5)] group text-center">
                    👤 Friend Add
                  </a>

                  {/* TikTok */}
                  <a href="https://www.tiktok.com/@zcbid" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-zinc-900/40 hover:bg-white border border-zinc-700 hover:border-white text-zinc-300 hover:text-black font-bold py-2.5 px-2 rounded-xl text-xs transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_15px_rgba(255,255,255,0.4)] group text-center">
                    🎥 TikTok
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}