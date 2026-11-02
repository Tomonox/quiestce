import React, { useState } from 'react';
import { Brainrot } from '../types/game';
import { Info, X } from 'lucide-react';
import { audio } from '../utils/audio';

interface CharacterCardProps {
  card: Brainrot;
  isEliminated: boolean;
  onToggleEliminate: (cardId: string) => void;
  isSelectableForGuess?: boolean;
  onSelectForGuess?: (card: Brainrot) => void;
  showTraitsByDefault?: boolean;
  compact?: boolean;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  card,
  isEliminated,
  onToggleEliminate,
  isSelectableForGuess = false,
  onSelectForGuess,
  showTraitsByDefault = false,
  compact = false
}) => {
  const [imgSrc, setImgSrc] = useState<string>(card.localImage || `/images/brainrots/${card.id}.png`);
  const [showDetails, setShowDetails] = useState<boolean>(showTraitsByDefault);

  const handleImageError = () => {
    if (imgSrc.startsWith('/images/brainrots/')) {
      setImgSrc(`/api/image-proxy?url=${encodeURIComponent(card.imageUrl)}`);
    } else {
      setImgSrc('/images/brainrots/placeholder.svg');
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isSelectableForGuess && onSelectForGuess) {
      onSelectForGuess(card);
      return;
    }
    audio.playCardFlip(!isEliminated);
    onToggleEliminate(card.id);
  };

  const getRarityBadgeStyle = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'bg-slate-600 text-white';
      case 'Rare': return 'bg-blue-600 text-white';
      case 'Epic': return 'bg-purple-600 text-white';
      case 'Legendary': return 'bg-amber-600 text-white';
      case 'Mythic': return 'bg-red-600 text-white';
      case 'Secret': return 'bg-teal-600 text-white';
      case 'Brainrot God': return 'bg-rose-700 text-white';
      case 'OG': return 'bg-pink-600 text-white';
      default: return 'bg-slate-700 text-white';
    }
  };

  return (
    <div className={`card-perspective-container select-none ${compact ? 'h-full min-h-0' : ''}`}>
      {/* Molded Plastic Tray Recessed Slot */}
      <div className={`relative plastic-slot flex flex-col items-center ${
        compact ? 'h-full min-h-0 p-1 justify-between' : 'p-1'
      }`}>
        {/* Yellow Plastic Door Hinged Flap */}
        <div
          onClick={handleClick}
          className={`w-full cursor-pointer relative ${compact ? 'h-full min-h-0 flex flex-col' : ''} ${
            isEliminated ? 'card-flap-down' : 'card-flap-standing'
          }`}
          style={{ willChange: 'transform' }}
        >
          {/* Yellow Molded Plastic Frame with authentic bevels */}
          <div className={`yellow-plastic-frame rounded-lg flex flex-col items-center relative transition-shadow hover:shadow-md ${
            compact ? 'h-full min-h-0 p-1 justify-between' : 'p-1.5'
          }`}>
            {/* Rarity & Info Header */}
            <div className={`w-full flex items-center justify-between px-0.5 pointer-events-none shrink-0 ${
              compact ? 'mb-0.5' : 'mb-1'
            }`}>
              <span
                className={`uppercase font-bold rounded shadow-xs tracking-wider ${
                  compact ? 'text-[7px] sm:text-[7.5px] px-1 py-0' : 'text-[8.5px] px-1.5 py-0.5'
                } ${getRarityBadgeStyle(card.rarity)}`}
              >
                {card.rarity}
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetails(!showDetails);
                }}
                className={`pointer-events-auto rounded-full bg-amber-800/80 hover:bg-amber-900 text-amber-100 flex items-center justify-center transition-colors ${
                  compact ? 'w-3.5 h-3.5' : 'w-4 h-4'
                }`}
                title="Détails du Brainrot"
              >
                <Info className={compact ? 'w-2 h-2' : 'w-2.5 h-2.5'} />
              </button>
            </div>

            {/* Inset White Paper Card Portrait */}
            <div className={`w-full bg-white rounded border border-amber-300 shadow-inner overflow-hidden flex items-center justify-center relative ${
              compact ? 'flex-1 min-h-[34px] p-0.5' : 'aspect-[4/4.2] p-1.5'
            }`}>
              <img
                src={imgSrc}
                alt={card.name}
                onError={handleImageError}
                loading="lazy"
                className={`max-h-full max-w-full object-contain filter drop-shadow-sm transition-transform duration-150 ${
                  isEliminated ? 'opacity-25 grayscale' : 'hover:scale-105'
                }`}
              />

              {/* Flipped Down Red Cross Stamp */}
              {isEliminated && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40">
                  <div className={`rounded-full bg-red-600 border border-white flex items-center justify-center shadow-md transform -rotate-12 ${
                    compact ? 'w-5 h-5' : 'w-7 h-7'
                  }`}>
                    <X className={`text-white stroke-[3.5] ${compact ? 'w-3 h-3' : 'w-4 h-4'}`} />
                  </div>
                </div>
              )}
            </div>

            {/* Official Qui Est-ce Name Plate at Bottom */}
            <div
              className={`w-full bg-white rounded border border-amber-300 text-center shadow-xs flex items-center justify-center shrink-0 ${
                compact ? 'mt-0.5 min-h-[16px] sm:min-h-[18px] py-0 px-0.5' : 'mt-1 min-h-[26px] sm:min-h-[28px] py-0.5 px-1'
              }`}
              title={card.name}
            >
              <span className={`font-black uppercase text-slate-900 tracking-tight line-clamp-1 leading-tight block ${
                compact ? 'text-[7px] sm:text-[8px]' : 'text-[9px] sm:text-[10px]'
              }`}>
                {card.name}
              </span>
            </div>

            {/* Molded Plastic Hinge Tabs at bottom */}
            <div className={`w-full flex justify-between shrink-0 ${
              compact ? 'px-2 -mb-1 mt-0' : 'px-2.5 -mb-2 mt-0.5'
            }`}>
              <div className={compact ? 'w-1.5 h-1 bg-[#d79900] rounded-b' : 'w-2 h-1.5 bg-[#d79900] rounded-b'}></div>
              <div className={compact ? 'w-1.5 h-1 bg-[#d79900] rounded-b' : 'w-2 h-1.5 bg-[#d79900] rounded-b'}></div>
            </div>
          </div>
        </div>

        {/* Floating Details Drawer */}
        {showDetails && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-md p-2.5 rounded-xl border border-amber-400/80 flex flex-col justify-between text-xs text-white shadow-2xl animate-in fade-in duration-100"
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-700 pb-1 mb-1.5">
                <span className="font-bold text-amber-300 truncate max-w-[110px]">
                  {card.name}
                </span>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-0.5 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-0.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Rareté :</span>
                  <span className="font-semibold text-amber-300">{card.rarity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Couleur :</span>
                  <span className="font-medium text-slate-200">{card.traits?.color || 'Multicolore'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Catégorie :</span>
                  <span className="font-medium text-slate-200">{card.traits?.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Chapeau :</span>
                  <span>{card.traits?.hasHat ? '✅ Oui' : '❌ Non'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Animal :</span>
                  <span>{card.traits?.isAnimal ? '✅ Oui' : '❌ Non'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Nourriture :</span>
                  <span>{card.traits?.isFood ? '✅ Oui' : '❌ Non'}</span>
                </div>
                {card.traits?.hasWeapon && (
                  <div className="flex justify-between text-red-300">
                    <span>Arme :</span>
                    <span>✅ Oui</span>
                  </div>
                )}
              </div>
            </div>

            {card.quote && (
              <p className="text-[10px] italic text-amber-200 bg-slate-900 p-1 rounded border border-slate-800 truncate mt-1">
                "{card.quote}"
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
