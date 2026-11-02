import React from 'react';
import { Volume2, VolumeX, BookOpen, Layers, LogOut, Copy, Check } from 'lucide-react';
import { audio } from '../utils/audio';

interface NavbarProps {
  onlineCount: number;
  inGameOrLobby: boolean;
  compact?: boolean;
  roomCode?: string;
  onOpenRules: () => void;
  onOpenEncyclopedia: () => void;
  onLeaveRoom?: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  playerNickname?: string;
  playerAvatar?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onlineCount,
  inGameOrLobby,
  compact = false,
  roomCode,
  onOpenRules,
  onOpenEncyclopedia,
  onLeaveRoom,
  soundEnabled,
  onToggleSound,
  playerNickname,
  playerAvatar
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyCode = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    audio.playCardFlip();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className={`sticky top-0 z-40 bg-[#0d131f]/95 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-5 ${
      compact ? 'py-1 sm:py-1.5' : 'py-2.5'
    }`}>
      <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-3">
        {/* Brand: MB Seal + Authentic QUI ? EST-CE */}
        <div className="flex items-center gap-2.5">
          <div className="mb-badge px-1.5 py-0.5 rounded text-center shadow shrink-0">
            <span className="text-[11px] leading-none block font-black tracking-wide">MB</span>
            <span className="text-[6.5px] leading-none block font-extrabold tracking-tighter">JEUX</span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className={`quiestce-brand-title leading-none ${compact ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'}`}>
                QUI <span className="quiestce-mark">?</span> EST-CE
              </span>
            </div>
            {!compact && (
              <span className="text-[10px] font-semibold text-slate-400 tracking-wide uppercase hidden sm:block">
                Édition Steal a Brainrot Roblox
              </span>
            )}
          </div>
        </div>

        {/* Room Code Indicator if in game/lobby */}
        {inGameOrLobby && roomCode && (
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 px-3 py-1 rounded-xl shadow-inner">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Salon :</span>
            <span className="font-mono font-black text-amber-400 tracking-widest text-sm">{roomCode}</span>
            <button
              onClick={handleCopyCode}
              className="text-slate-400 hover:text-white transition-colors ml-0.5"
              title="Copier le code du salon"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

        {/* Right Navigation Controls */}
        <div className="flex items-center gap-2">
          {/* Still, honest online count (No pulsing dot) */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/50 text-xs font-medium text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>{onlineCount} en ligne</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Couper le son' : 'Activer le son'}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Rules Modal Button */}
          <button
            onClick={onOpenRules}
            aria-label="Règles du jeu"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* 180 Collection Button */}
          <button
            onClick={onOpenEncyclopedia}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/60 text-xs font-semibold transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Collection (180)</span>
          </button>

          {/* Player avatar & nickname */}
          {playerNickname && (
            <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 px-2.5 py-1 rounded-xl">
              <span className="text-base leading-none">{playerAvatar || '👑'}</span>
              <span className="text-xs font-semibold text-slate-200 max-w-[100px] truncate hidden lg:block">
                {playerNickname}
              </span>
            </div>
          )}

          {/* Leave room */}
          {inGameOrLobby && onLeaveRoom && (
            <button
              onClick={onLeaveRoom}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/90 hover:bg-red-600 text-white border border-red-500/80 text-xs font-semibold shadow-sm transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Quitter</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
