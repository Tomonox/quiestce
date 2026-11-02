import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Frown, RotateCcw, Home } from 'lucide-react';
import { Brainrot, Player } from '../types/game';
import { audio } from '../utils/audio';

interface GameOverModalProps {
  isOpen: boolean;
  isWinner: boolean;
  winnerNickname: string;
  winReason: string | null;
  mySecret: Brainrot | null;
  opponentSecret: Brainrot | null;
  opponent: Player | null;
  onRematch: () => void;
  onLeave: () => void;
  rematchRequested: boolean;
  opponentRematchRequested?: boolean;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  isWinner,
  winnerNickname,
  winReason,
  mySecret,
  opponentSecret,
  opponent,
  onRematch,
  onLeave,
  rematchRequested,
  opponentRematchRequested
}) => {
  useEffect(() => {
    if (isOpen) {
      if (isWinner) {
        audio.playVictory();
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } else {
        audio.playDefeat();
      }
    }
  }, [isOpen, isWinner]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl text-center text-white">
        {/* Banner */}
        <div className="p-6 bg-slate-950 border-b border-slate-800">
          <div className="inline-flex p-3 rounded-2xl bg-slate-900 border border-slate-700 mb-3 shadow-inner">
            {isWinner ? (
              <Trophy className="w-12 h-12 text-amber-400" />
            ) : (
              <Frown className="w-12 h-12 text-slate-400" />
            )}
          </div>

          <h2 className="quiestce-brand-title text-3xl sm:text-4xl tracking-tight leading-none">
            {isWinner ? 'VICTOIRE !' : 'DÉFAITE...'}
          </h2>

          <p className="text-sm font-semibold text-slate-300 mt-2">
            Vainqueur de la manche : <span className="text-amber-400 font-bold">{winnerNickname}</span>
          </p>

          {winReason && (
            <p className="text-xs text-slate-300 mt-2 max-w-md mx-auto bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              {winReason}
            </p>
          )}
        </div>

        {/* Revealed Mystery Characters in Yellow Flap Frames */}
        <div className="p-5 sm:p-6 bg-slate-900/60 border-b border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            Révélation des 2 personnages secrets
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {/* My Secret */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-semibold text-slate-300 mb-1.5">
                Ton Brainrot secret :
              </span>
              <div className="yellow-plastic-frame p-2 rounded-xl shadow-lg w-28 sm:w-32">
                <div className="w-full aspect-square bg-white rounded border border-amber-300 p-1 flex items-center justify-center">
                  {mySecret ? (
                    <img
                      src={mySecret.localImage || `/images/brainrots/${mySecret.id}.png`}
                      alt={mySecret.name}
                      className="w-full h-full object-contain filter drop-shadow"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/brainrots/placeholder.svg';
                      }}
                    />
                  ) : (
                    <span>❓</span>
                  )}
                </div>
                <div className="mt-1 py-0.5 bg-white rounded text-center">
                  <span className="text-[11px] font-black text-slate-900 uppercase truncate block px-1">
                    {mySecret?.name || 'Inconnu'}
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-amber-300 mt-1">
                {mySecret?.rarity}
              </span>
            </div>

            {/* Opponent's Secret */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-semibold text-slate-300 mb-1.5">
                Secret de {opponent?.nickname || 'l\'adversaire'} :
              </span>
              <div className="yellow-plastic-frame p-2 rounded-xl shadow-lg w-28 sm:w-32">
                <div className="w-full aspect-square bg-white rounded border border-amber-300 p-1 flex items-center justify-center">
                  {opponentSecret ? (
                    <img
                      src={opponentSecret.localImage || `/images/brainrots/${opponentSecret.id}.png`}
                      alt={opponentSecret.name}
                      className="w-full h-full object-contain filter drop-shadow"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/brainrots/placeholder.svg';
                      }}
                    />
                  ) : (
                    <span>❓</span>
                  )}
                </div>
                <div className="mt-1 py-0.5 bg-white rounded text-center">
                  <span className="text-[11px] font-black text-slate-900 uppercase truncate block px-1">
                    {opponentSecret?.name || 'Inconnu'}
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-amber-300 mt-1">
                {opponentSecret?.rarity}
              </span>
            </div>
          </div>
        </div>

        {/* Rematch Status & Actions */}
        <div className="p-5 sm:p-6 space-y-4">
          {opponentRematchRequested && !rematchRequested && (
            <p className="text-xs font-bold text-amber-400">
              ⚡ {opponent?.nickname} souhaite rejouer !
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onRematch}
              disabled={rematchRequested}
              className={`flex-1 py-3 px-5 rounded-xl text-sm font-bold border border-red-400/40 flex items-center justify-center gap-2 transition-all ${
                rematchRequested
                  ? 'bg-slate-800 text-slate-400 cursor-wait'
                  : 'btn-tactile-red text-white'
              }`}
            >
              <RotateCcw className={`w-4 h-4 ${rematchRequested ? 'animate-spin' : ''}`} />
              <span>{rematchRequested ? 'En attente de l\'adversaire...' : 'REJOUER (24 NOUVEAUX BRAINROTS)'}</span>
            </button>

            <button
              onClick={onLeave}
              className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Accueil</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
