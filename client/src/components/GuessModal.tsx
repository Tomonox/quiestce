import React, { useState } from 'react';
import { Brainrot } from '../types/game';
import { AlertTriangle, Search, X, CheckCircle2, ShieldAlert } from 'lucide-react';
import { audio } from '../utils/audio';

interface GuessModalProps {
  isOpen: boolean;
  onClose: () => void;
  board: Brainrot[];
  onConfirmGuess: (brainrotId: string) => void;
}

export const GuessModal: React.FC<GuessModalProps> = ({
  isOpen,
  onClose,
  board,
  onConfirmGuess
}) => {
  const [search, setSearch] = useState<string>('');
  const [selectedCard, setSelectedCard] = useState<Brainrot | null>(null);

  if (!isOpen) return null;

  const filtered = board.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.rarity.toLowerCase().includes(search.toLowerCase())
  );

  const handleConfirm = () => {
    if (!selectedCard) return;
    onConfirmGuess(selectedCard.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl text-white">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Deviner le Brainrot adverse
              </h2>
              <p className="text-xs text-slate-400">
                Choisis avec certitude le personnage secret de ton adversaire
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* High-stakes Warning Banner */}
        <div className="p-3.5 mx-4 mt-4 rounded-xl bg-red-950/40 border border-red-500/30 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 leading-relaxed">
            <span className="font-bold text-red-300">RÈGLE DU JEU :</span> Si ton accusation est correcte, tu remportes immédiatement la victoire ! Mais si tu te trompes, tu perds immédiatement la partie.
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pt-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom ou rareté..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Board Selection Grid */}
        <div className="p-4 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {filtered.map(card => {
            const isSelected = selectedCard?.id === card.id;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => {
                  setSelectedCard(card);
                  audio.playCardFlip();
                }}
                className={`p-2 rounded-xl border text-left transition-all flex flex-col items-center gap-1.5 relative ${
                  isSelected
                    ? 'bg-amber-400/20 border-amber-400 ring-2 ring-amber-400/50'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
                <div className="w-14 h-14 bg-white rounded-lg p-1 flex items-center justify-center shadow-inner">
                  <img
                    src={card.localImage || `/images/brainrots/${card.id}.png`}
                    alt={card.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/brainrots/placeholder.svg';
                    }}
                  />
                </div>
                <div className="text-center w-full">
                  <span className="text-[11px] font-bold text-white block truncate">
                    {card.name}
                  </span>
                  <span className="text-[9px] uppercase font-semibold text-slate-400">
                    {card.rarity}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400 truncate">
            {selectedCard ? (
              <span>Sélectionné : <b className="text-amber-400 font-bold">{selectedCard.name}</b></span>
            ) : (
              <span>Clique sur un Brainrot pour le désigner</span>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedCard}
              className="px-5 py-2.5 rounded-xl btn-tactile-red text-white text-xs font-bold border border-red-400/40 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ACCUSER CE BRAINROT !
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
