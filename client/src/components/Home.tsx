import React, { useState } from 'react';
import { Play, PlusCircle, LogIn, BookOpen, Layers, Users, Sparkles } from 'lucide-react';
import { audio } from '../utils/audio';

interface HomeProps {
  nickname: string;
  avatar: string;
  onUpdateNickname: (nick: string) => void;
  onUpdateAvatar: (av: string) => void;
  onCreateRoom: (boardSize: number) => void;
  onJoinRoom: (code: string) => void;
  onOpenRules: () => void;
  onOpenEncyclopedia: () => void;
  initialRoomCode?: string;
}

const AVATARS = ['👑', '⚡', '🧠', '🦖', '🐘', '🍕', '🥑', '🍌', '💀', '🦍', '🐱', '🐸'];

export const Home: React.FC<HomeProps> = ({
  nickname,
  avatar,
  onUpdateNickname,
  onUpdateAvatar,
  onCreateRoom,
  onJoinRoom,
  onOpenRules,
  onOpenEncyclopedia,
  initialRoomCode = ''
}) => {
  const [joinCode, setJoinCode] = useState<string>(initialRoomCode);
  const [testFlipped, setTestFlipped] = useState<Record<string, boolean>>({});

  const handleCreate = () => {
    onCreateRoom(24);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    onJoinRoom(joinCode.trim().toUpperCase());
  };

  const toggleTestFlap = (id: string) => {
    const isNowFlipped = !testFlipped[id];
    audio.playCardFlip(isNowFlipped);
    setTestFlipped(prev => ({ ...prev, [id]: isNowFlipped }));
  };

  const sampleFlaps = [
    { name: 'Strawberry Elephant', rarity: 'OG', id: 'strawberry_elephant' },
    { name: 'Noobini Pizzanini', rarity: 'Common', id: 'noobini_pizzanini' },
    { name: 'Nuclearo Dinossauro', rarity: 'Secret', id: 'nuclearo_dinossauro' },
    { name: 'Avocadorilla', rarity: 'Mythic', id: 'avocadorilla' },
    { name: 'Ballerina Cappuccina', rarity: 'Legendary', id: 'ballerina_cappuccina' },
    { name: 'John Pork', rarity: 'OG', id: 'john_pork' }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-12 animate-in fade-in duration-200">
      {/* Box Cover Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2.5">
          <div className="mb-badge px-2.5 py-1 rounded-md text-center shadow-md">
            <span className="text-sm leading-none block font-black">MB</span>
            <span className="text-[8px] leading-none block font-extrabold tracking-tighter">JEUX</span>
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Jeu officiel de déduction multijoueur
          </span>
        </div>

        <div>
          <h1 className="quiestce-brand-title text-5xl sm:text-7xl md:text-8xl leading-none">
            QUI <span className="quiestce-mark">?</span> EST-CE
          </h1>
        </div>

        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
          Le duel culte de déduction en face-à-face avec les personnages de <b>Steal a Brainrot</b>.
          À chaque partie, <b>24 Brainrots</b> sont tirés au sort parmi les 180 personnages officiels.
          Pose les bonnes questions, fais basculer les fenêtres jaunes et devine le personnage secret !
        </p>
      </div>

      {/* Main Hub: Profile + Play Actions */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        {/* Profile Card (Left 5 cols) */}
        <div className="md:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <span className="text-3xl p-2.5 rounded-2xl bg-slate-800 border border-slate-700 shadow-inner">
                {avatar}
              </span>
              <div>
                <h3 className="text-base font-bold text-white">Ton Profil Joueur</h3>
                <p className="text-xs text-slate-400">Personnalise ton pseudo et ton icône</p>
              </div>
            </div>

            <div>
              <label htmlFor="nickname-input" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Pseudo en jeu :
              </label>
              <input
                id="nickname-input"
                type="text"
                value={nickname}
                onChange={(e) => onUpdateNickname(e.target.value)}
                maxLength={20}
                placeholder="Ex: NoobMaster"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Choisir un avatar :
              </label>
              <div className="grid grid-cols-6 gap-2">
                {AVATARS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => {
                      onUpdateAvatar(av);
                      audio.playCardFlip();
                    }}
                    className={`text-2xl p-2 rounded-xl border transition-all ${
                      avatar === av
                        ? 'bg-amber-400/20 border-amber-400 scale-105 shadow-sm'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Synchronisation multijoueur</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              En ligne
            </span>
          </div>
        </div>

        {/* Play Launcher (Right 7 cols) */}
        <div className="md:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Play className="w-4 h-4 text-amber-400 fill-current" />
                  <span>Partie Multijoueur en Ligne</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Duel 1v1 en temps réel • 24 Brainrots piochés au sort
                </p>
              </div>
            </div>

            {/* Create Room Button with tactile Hasbro click depth */}
            <button
              onClick={handleCreate}
              className="w-full py-4 px-6 rounded-xl btn-tactile-red text-white font-extrabold text-base sm:text-lg flex items-center justify-center gap-3 border border-red-400/40"
            >
              <PlusCircle className="w-5 h-5 stroke-[2.5]" />
              <span>CRÉER UNE NOUVELLE PARTIE</span>
            </button>

            {/* Join Room Form */}
            <form onSubmit={handleJoin} className="space-y-2 pt-2">
              <label htmlFor="join-code-input" className="block text-xs font-semibold text-slate-300">
                Rejoindre la partie d'un ami :
              </label>
              <div className="flex gap-2">
                <input
                  id="join-code-input"
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="CODE (EX: R9XZ2)"
                  maxLength={6}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-mono font-bold tracking-widest text-center text-base focus:outline-none focus:border-amber-400 uppercase placeholder-slate-600 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!joinCode.trim()}
                  className="px-6 rounded-xl btn-tactile-blue text-white font-bold text-sm border border-blue-400/30 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4 stroke-[2.5]" />
                  <span>Rejoindre</span>
                </button>
              </div>
            </form>
          </div>

          {/* Secondary Quick Links */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
            <button
              onClick={onOpenRules}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-colors flex items-center gap-3"
            >
              <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Règles du Jeu</span>
                <span className="text-[11px] text-slate-400">Guide officiel</span>
              </div>
            </button>

            <button
              onClick={onOpenEncyclopedia}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-colors flex items-center gap-3"
            >
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Les 180 Brainrots</span>
                <span className="text-[11px] text-slate-400">Toute la collection</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Visual Showcase: Interactive Yellow Flaps Preview */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">
              Aperçu des Fenêtres Jaunes du Plateau
            </h3>
            <p className="text-xs text-slate-400">
              Clique sur une fenêtre ci-dessous pour tester le mécanisme de bascule 3D !
            </p>
          </div>

          <button
            onClick={onOpenEncyclopedia}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
          >
            Explorer toute la collection (180) →
          </button>
        </div>

        {/* 6 Interactive Flaps */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {sampleFlaps.map((card) => {
            const isFlipped = !!testFlipped[card.id];
            return (
              <div
                key={card.id}
                onClick={() => toggleTestFlap(card.id)}
                className="card-perspective-container cursor-pointer select-none"
                title="Clique pour basculer"
              >
                <div
                  className={`w-full ${
                    isFlipped ? 'card-flap-down' : 'card-flap-standing'
                  }`}
                >
                  <div className="yellow-plastic-frame rounded-xl p-2 flex flex-col items-center">
                    <span className="text-[9px] font-extrabold uppercase text-amber-950 bg-yellow-200/90 px-1.5 py-0.5 rounded shadow-xs mb-1">
                      {card.rarity}
                    </span>
                    <div className="w-full aspect-square bg-white rounded border border-amber-300 p-1 flex items-center justify-center shadow-inner">
                      <img
                        src={`/images/brainrots/${card.id}.png`}
                        alt={card.name}
                        className="w-full h-full object-contain filter drop-shadow-sm"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/brainrots/placeholder.svg';
                        }}
                      />
                    </div>
                    <div className="w-full mt-1.5 min-h-[30px] px-1 py-0.5 bg-white rounded border border-amber-300 text-center shadow-xs flex items-center justify-center">
                      <span className="text-[9.5px] sm:text-[10px] font-extrabold uppercase text-slate-900 leading-tight line-clamp-2 block">
                        {card.name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
