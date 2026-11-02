import React, { useState, useEffect } from 'react';
import { Brainrot } from '../types/game';
import { Layers, Search, X } from 'lucide-react';

interface EncyclopediaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EncyclopediaModal: React.FC<EncyclopediaModalProps> = ({
  isOpen,
  onClose
}) => {
  const [brainrots, setBrainrots] = useState<Brainrot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedRarity, setSelectedRarity] = useState<string>('All');
  const [selectedCard, setSelectedCard] = useState<Brainrot | null>(null);

  useEffect(() => {
    if (isOpen && brainrots.length === 0) {
      fetch('/api/brainrots')
        .then(res => res.json())
        .then(data => {
          setBrainrots(data);
          setLoading(false);
        })
        .catch(() => {
          fetch('/brainrots.json')
            .then(res => res.json())
            .then(data => {
              setBrainrots(data);
              setLoading(false);
            });
        });
    }
  }, [isOpen, brainrots.length]);

  if (!isOpen) return null;

  const rarities = ['All', 'Common', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Secret', 'OG', 'Brainrot God'];

  const filtered = brainrots.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.rarity.toLowerCase().includes(search.toLowerCase()) ||
      (b.traits?.type && b.traits.type.toLowerCase().includes(search.toLowerCase()));
    const matchesRarity = selectedRarity === 'All' || b.rarity.toLowerCase() === selectedRarity.toLowerCase();
    return matchesSearch && matchesRarity;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-5xl w-full h-[90vh] flex flex-col overflow-hidden shadow-2xl text-white">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Collection Steal a Brainrot</span>
                <span className="text-xs bg-slate-800 text-amber-300 px-2.5 py-0.5 rounded-full border border-slate-700">
                  {brainrots.length} personnages
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Toutes les illustrations et caractéristiques officielles du jeu Roblox
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

        {/* Filter Bar */}
        <div className="p-3 sm:p-4 bg-slate-950/80 border-b border-slate-800 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom, rareté, animal, pizza..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Rarity filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {rarities.map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRarity(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedRarity === r
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {r === 'All' ? 'Tous' : r}
              </button>
            ))}
          </div>
        </div>

        {/* Grid of Characters */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {loading ? (
            <div className="col-span-full text-center py-20 text-slate-400">
              Chargement des 180 Brainrots... 🧠
            </div>
          ) : filtered.length === 0 ? (
            <div className="col-span-full text-center py-20 text-slate-500 text-sm">
              Aucun personnage ne correspond à votre recherche.
            </div>
          ) : (
            filtered.map((card) => (
              <div
                key={card.id}
                onClick={() => setSelectedCard(card)}
                className="group relative p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-400/80 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="w-full aspect-square flex items-center justify-center p-1.5 bg-slate-900 rounded-lg">
                  <img
                    src={card.localImage || `/images/brainrots/${card.id}.png`}
                    alt={card.name}
                    loading="lazy"
                    className="w-full h-full object-contain filter drop-shadow group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/brainrots/placeholder.svg';
                    }}
                  />
                </div>

                <div className="mt-2 text-center">
                  <span className="text-[9px] uppercase font-bold text-amber-400 block truncate">
                    {card.rarity}
                  </span>
                  <h4 className="text-xs font-bold text-white group-hover:text-amber-300 truncate">
                    {card.name}
                  </h4>
                  {card.income && card.income !== '?' && (
                    <span className="text-[10px] text-emerald-400 font-mono">
                      ${card.income}/s
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected Card Modal popup */}
        {selectedCard && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
            onClick={() => setSelectedCard(null)}
          >
            <div
              className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-amber-300 bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-400/40">
                    {selectedCard.rarity}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1.5">
                    {selectedCard.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedCard(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="w-40 h-40 mx-auto rounded-2xl bg-slate-950 p-2 flex items-center justify-center border border-slate-800">
                <img
                  src={selectedCard.localImage || `/images/brainrots/${selectedCard.id}.png`}
                  alt={selectedCard.name}
                  className="w-full h-full object-contain filter drop-shadow-xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/brainrots/placeholder.svg';
                  }}
                />
              </div>

              <div className="space-y-2 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Catégorie :</span>
                  <span className="font-semibold text-white">{selectedCard.traits?.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Couleur dominante :</span>
                  <span className="font-semibold text-white">{selectedCard.traits?.color}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Revenu en jeu :</span>
                  <span className="font-mono text-emerald-400 font-bold">${selectedCard.income}/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Coût Roblox :</span>
                  <span className="font-mono text-amber-400 font-bold">${selectedCard.cost}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Chapeau / Casque :</span>
                  <span>{selectedCard.traits?.hasHat ? '✅ Oui' : '❌ Non'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Animal :</span>
                  <span>{selectedCard.traits?.isAnimal ? '✅ Oui' : '❌ Non'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Nourriture :</span>
                  <span>{selectedCard.traits?.isFood ? '✅ Oui' : '❌ Non'}</span>
                </div>
              </div>

              {selectedCard.quote && (
                <p className="text-xs italic text-amber-200 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  « {selectedCard.quote} »
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
