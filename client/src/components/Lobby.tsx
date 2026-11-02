import React, { useState } from 'react';
import { RoomState } from '../types/game';
import { Users, Copy, Check, Share2, Play, Crown, LogOut, Shuffle } from 'lucide-react';
import { audio } from '../utils/audio';

interface LobbyProps {
  room: RoomState;
  onStartGame: () => void;
  onLeaveRoom: () => void;
}

export const Lobby: React.FC<LobbyProps> = ({
  room,
  onStartGame,
  onLeaveRoom
}) => {
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const isHost = room.me?.isHost;
  const isReady = room.opponent !== null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopiedCode(true);
    audio.playCardFlip();
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    const inviteUrl = `${window.location.origin}${window.location.pathname}?room=${room.code}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    audio.playCardFlip();
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 space-y-8 animate-in fade-in duration-200">
      {/* Title */}
      <div className="text-center space-y-2">
        <h2 className="quiestce-brand-title text-3xl sm:text-4xl">
          SALLE D'ATTENTE
        </h2>
        <p className="text-sm text-slate-300 font-medium">
          Transmets le code ou le lien à ton adversaire pour démarrer le duel !
        </p>
      </div>

      {/* Room Code Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-xl">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
          Code du salon
        </span>

        <div className="inline-block bg-slate-950 border border-slate-700 px-8 py-3 rounded-2xl shadow-inner">
          <span className="font-mono text-4xl sm:text-5xl font-black tracking-widest text-amber-400">
            {room.code}
          </span>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
          >
            {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedCode ? 'Code copié !' : 'Copier le code'}</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl btn-tactile-blue text-white text-xs font-bold border border-blue-400/40 shadow-sm transition-all active:scale-95"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedLink ? 'Lien copié !' : 'Partager le lien'}</span>
          </button>
        </div>
      </div>

      {/* Players: Team Blue vs Team Red */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Host (Blue Tray) */}
        <div className="plastic-tray-blue p-5 rounded-2xl text-white shadow-lg flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-white/20 border border-white/40 flex items-center justify-center text-3xl shadow-inner shrink-0 p-2">
            {room.me?.avatar || '👑'}
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-extrabold uppercase text-amber-300 tracking-wider block">
              ÉQUIPE BLEUE • HÔTE
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-base font-extrabold truncate">
                {room.me?.nickname} (Toi)
              </span>
              <Crown className="w-4 h-4 text-amber-300 shrink-0 fill-current" />
            </div>
            <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500 text-white">
              Prêt
            </span>
          </div>
        </div>

        {/* Guest (Red Tray) */}
        <div className={`p-5 rounded-2xl transition-all shadow-lg flex items-center gap-4 ${
          isReady
            ? 'plastic-tray-red text-white'
            : 'bg-slate-900/60 border-2 border-dashed border-slate-700 text-slate-400'
        }`}>
          {isReady ? (
            <>
              <div className="w-13 h-13 rounded-2xl bg-white/20 border border-white/40 flex items-center justify-center text-3xl shadow-inner shrink-0 p-2">
                {room.opponent?.avatar || '⚡'}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-extrabold uppercase text-amber-300 tracking-wider block">
                  ÉQUIPE ROUGE • INVITÉ
                </span>
                <span className="text-base font-extrabold truncate block mt-0.5">
                  {room.opponent?.nickname}
                </span>
                <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                  Prêt
                </span>
              </div>
            </>
          ) : (
            <div className="w-full flex items-center justify-center gap-2.5 py-4">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
              <span className="text-xs sm:text-sm font-semibold text-slate-300">
                En attente du second joueur...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Rules Notice */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3 text-xs text-slate-300">
        <Shuffle className="w-5 h-5 text-amber-400 shrink-0" />
        <span>
          Au démarrage, <b>24 Brainrots</b> seront tirés au sort parmi les 180 personnages. Chaque joueur recevra un Brainrot secret unique à faire deviner.
        </span>
      </div>

      {/* Start Button */}
      <div className="space-y-3 pt-2">
        {isHost ? (
          <button
            onClick={onStartGame}
            disabled={!isReady}
            className="w-full py-4 px-6 rounded-xl btn-tactile-red text-white text-lg font-black border border-red-400/40 flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>{isReady ? 'LANCER LA PARTIE !' : 'EN ATTENTE DE L\'ADVERSAIRE'}</span>
          </button>
        ) : (
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center text-slate-300 text-sm font-medium">
            Connecté ! L'hôte va lancer la partie dès qu'il est prêt.
          </div>
        )}

        <div className="text-center pt-2">
          <button
            onClick={onLeaveRoom}
            className="text-xs font-semibold text-red-400 hover:text-red-300 hover:underline inline-flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Quitter le salon</span>
          </button>
        </div>
      </div>
    </div>
  );
};
