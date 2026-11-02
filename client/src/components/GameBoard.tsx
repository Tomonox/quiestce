import React, { useState, useEffect } from 'react';
import { RoomState, Brainrot } from '../types/game';
import { CharacterCard } from './CharacterCard';
import { QuestionModal } from './QuestionModal';
import { AnswerPrompt } from './AnswerPrompt';
import { GuessModal } from './GuessModal';
import { HistoryDrawer } from './HistoryDrawer';
import { HelpCircle, AlertTriangle, History, Search, RotateCcw, Eye, EyeOff, Smartphone, Monitor, X } from 'lucide-react';

interface GameBoardProps {
  room: RoomState;
  onAskQuestion: (category: string, questionText: string) => void;
  onAnswerQuestion: (answer: 'OUI' | 'NON') => void;
  onMakeGuess: (brainrotId: string) => void;
  onToggleEliminate: (cardId: string) => void;
  onResetEliminations: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  room,
  onAskQuestion,
  onAnswerQuestion,
  onMakeGuess,
  onToggleEliminate,
  onResetEliminations
}) => {
  const [showQuestionModal, setShowQuestionModal] = useState<boolean>(false);
  const [showGuessModal, setShowGuessModal] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showMySecretModal, setShowMySecretModal] = useState<boolean>(false);

  // Stream Layout & Streamer Secret Privacy
  const [streamLayout, setStreamLayout] = useState<'landscape' | 'tiktok-vertical'>('landscape');
  const [hideSecret, setHideSecret] = useState<boolean>(false);

  // Auto-detect orientation for TikTok vertical capture vs landscape
  useEffect(() => {
    const checkOrientation = () => {
      if (window.innerWidth < 800 || window.innerHeight > window.innerWidth) {
        setStreamLayout('tiktok-vertical');
      } else {
        setStreamLayout('landscape');
      }
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [activeTraitFilter, setActiveTraitFilter] = useState<string | null>(null);

  const isMyTurn = room.currentTurnPlayerId === room.me?.socketId;
  const isAnswering = room.turnState === 'answering';
  const myEliminated = room.me?.eliminatedCards || [];
  const totalCards = room.board.length;
  const remainingCount = totalCards - myEliminated.length;

  // Player 1 gets classic Blue tray, Player 2 gets classic Red tray
  const isBlueTray = room.me?.isHost;
  const trayClass = isBlueTray ? 'plastic-tray-blue' : 'plastic-tray-red';

  // Answer prompt condition: Opponent asked a question, waiting for ME to answer
  const isQuestionForMe = isAnswering && room.pendingQuestion && room.pendingQuestion.askerId !== room.me?.socketId;

  const traitFilters = [
    { id: 'hasHat', label: 'Chapeau', filter: (b: Brainrot) => b.traits?.hasHat },
    { id: 'isAnimal', label: 'Animal', filter: (b: Brainrot) => b.traits?.isAnimal },
    { id: 'isFood', label: 'Nourriture', filter: (b: Brainrot) => b.traits?.isFood },
    { id: 'hasGlasses', label: 'Lunettes', filter: (b: Brainrot) => b.traits?.hasGlasses },
    { id: 'hasWeapon', label: 'Arme', filter: (b: Brainrot) => b.traits?.hasWeapon },
    { id: 'isFlying', label: 'Volant', filter: (b: Brainrot) => b.traits?.isFlying }
  ];

  const filteredBoard = room.board.filter(card => {
    const matchesSearch = card.name.toLowerCase().includes(search.toLowerCase()) ||
      card.rarity.toLowerCase().includes(search.toLowerCase());
    
    let matchesTrait = true;
    if (activeTraitFilter) {
      const selected = traitFilters.find(t => t.id === activeTraitFilter);
      if (selected) matchesTrait = !!selected.filter(card);
    }

    return matchesSearch && matchesTrait;
  });

  return (
    <div className="flex-1 min-h-0 flex flex-col p-2 sm:p-3 w-full max-w-[1920px] mx-auto overflow-hidden gap-2 animate-in fade-in duration-200">
      {/* Game Action HUD & Stream Bar */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-2 sm:p-2.5 shadow-xl flex items-center justify-between gap-2.5 shrink-0">
        {/* Left: Docked Player Secret Mystery Card */}
        <div className="flex items-center gap-2.5 bg-slate-950/80 border border-amber-400/60 rounded-xl px-2.5 py-1.5 shadow-inner">
          {/* Secret miniature flap */}
          <div className="yellow-plastic-frame rounded-lg p-1 shrink-0 w-10 h-11 flex items-center justify-center relative shadow">
            {hideSecret ? (
              <div className="w-full h-full bg-slate-900 rounded flex items-center justify-center text-xs">
                🙈
              </div>
            ) : room.me?.secret ? (
              <div className="w-full h-full bg-white rounded border border-amber-300 p-0.5 flex items-center justify-center">
                <img
                  src={room.me.secret.localImage || `/images/brainrots/${room.me.secret.id}.png`}
                  alt={room.me.secret.name}
                  className="w-full h-full object-contain filter drop-shadow-xs"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/brainrots/placeholder.svg';
                  }}
                />
              </div>
            ) : (
              <span className="text-xs">❓</span>
            )}
          </div>

          {/* Secret character label & stream hide toggle */}
          <div className="leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-black uppercase tracking-wider text-amber-400">
                TON PERSONNAGE
              </span>
              <button
                onClick={() => setHideSecret(!hideSecret)}
                className="text-[10px] text-slate-400 hover:text-white transition-colors"
                title={hideSecret ? "Afficher le secret" : "Masquer pour le stream TikTok"}
              >
                {hideSecret ? <Eye className="w-3 h-3 text-amber-400" /> : <EyeOff className="w-3 h-3" />}
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-extrabold text-white max-w-[130px] sm:max-w-[180px] truncate block">
                {hideSecret ? '••••••••••' : (room.me?.secret?.name || 'Inconnu')}
              </span>
              <button
                onClick={() => setShowMySecretModal(true)}
                className="text-[10px] text-amber-300 hover:text-white underline font-medium"
              >
                Détails
              </button>
            </div>
          </div>
        </div>

        {/* Center: Turn indicator & Counters */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 border shadow-sm ${
              isMyTurn
                ? 'bg-amber-400 text-slate-950 border-amber-300 animate-pulse'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <span>{isMyTurn ? '🎯 À TON TOUR !' : `⏳ TOUR DE ${room.opponent?.nickname || 'L\'ADVERSAIRE'}`}</span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-300">
            <span className="bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg">
              Tour #{room.turnNumber}
            </span>
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-lg">
              {remainingCount} / {totalCards} actifs
            </span>
          </div>
        </div>

        {/* Right: Actions & TikTok Stream Layout Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setShowQuestionModal(true)}
            disabled={!isMyTurn || isAnswering}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl btn-tactile-blue text-white text-xs sm:text-sm font-bold border border-blue-400/40 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">QUESTION</span>
          </button>

          <button
            onClick={() => setShowGuessModal(true)}
            disabled={!isMyTurn || isAnswering}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl btn-tactile-red text-white text-xs sm:text-sm font-bold border border-red-400/40 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">DEVINER !</span>
          </button>

          <button
            onClick={() => setShowHistory(true)}
            title="Historique des questions"
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            <History className="w-4 h-4" />
          </button>

          {/* TikTok Live Studio Layout Switcher (16:9 Landscape vs 9:16 Vertical) */}
          <button
            onClick={() => setStreamLayout(streamLayout === 'landscape' ? 'tiktok-vertical' : 'landscape')}
            title="Changer la disposition (16:9 Plein Écran ou 9:16 TikTok Vertical)"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-slate-700 text-xs font-bold transition-all"
          >
            {streamLayout === 'landscape' ? (
              <>
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden lg:inline text-[11px]">16:9 Paysage</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden lg:inline text-[11px]">9:16 TikTok</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* The Physical Toy Game Tray Container (Zero-Scroll 100% Fit) */}
      <div className={`flex-1 min-h-0 flex flex-col ${trayClass} rounded-2xl p-2 sm:p-2.5 shadow-2xl relative overflow-hidden transition-all duration-300 ${
        streamLayout === 'tiktok-vertical' ? 'max-w-2xl mx-auto w-full' : 'w-full'
      }`}>
        {/* Tray Header Bar (Authentic Board Label + Filters + Pegs) */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-white/20 pb-1.5 text-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-white">
              {room.me?.nickname} • {isBlueTray ? 'BLEU' : 'ROUGE'}
            </span>
            <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded text-amber-300 font-semibold">
              {remainingCount} restants
            </span>
          </div>

          {/* Quick Trait Filters & Search */}
          <div className="flex items-center gap-1 text-[11px] overflow-x-auto scrollbar-none">
            <div className="relative w-28 sm:w-36">
              <Search className="w-3 h-3 text-slate-300 absolute left-2 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filtrer..."
                className="w-full pl-6 pr-2 py-0.5 rounded-lg bg-black/40 text-white placeholder-slate-400 text-[10px] font-medium border border-white/20 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>

            {traitFilters.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTraitFilter(activeTraitFilter === t.id ? null : t.id)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold whitespace-nowrap border transition-all ${
                  activeTraitFilter === t.id
                    ? 'bg-amber-400 text-slate-950 border-white shadow'
                    : 'bg-black/30 text-white border-white/20 hover:bg-black/50'
                }`}
              >
                {t.label}
              </button>
            ))}

            {myEliminated.length > 0 && (
              <button
                onClick={onResetEliminations}
                className="text-[10px] font-semibold bg-amber-500 hover:bg-amber-400 text-white px-2 py-0.5 rounded-lg border border-white flex items-center gap-1 shadow-sm transition-colors"
                title="Rétablir toutes les cartes éliminées"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span className="hidden sm:inline">Rétablir</span>
              </button>
            )}
          </div>
        </div>

        {/* The 24 Characters Grid: 100% Height, ZERO Scrolling */}
        <div className={`flex-1 min-h-0 grid gap-1 sm:gap-1.5 h-full w-full pt-1.5 ${
          streamLayout === 'landscape'
            ? 'grid-cols-6 grid-rows-4'
            : 'grid-cols-4 grid-rows-6'
        }`}>
          {filteredBoard.map((card) => {
            const isEliminated = myEliminated.includes(card.id);
            return (
              <CharacterCard
                key={card.id}
                card={card}
                isEliminated={isEliminated}
                onToggleEliminate={onToggleEliminate}
                compact={true}
              />
            );
          })}
        </div>
      </div>

      {/* Question Modal */}
      <QuestionModal
        isOpen={showQuestionModal}
        onClose={() => setShowQuestionModal(false)}
        onSendQuestion={onAskQuestion}
      />

      {/* Answer Prompt */}
      {isQuestionForMe && (
        <AnswerPrompt
          question={room.pendingQuestion}
          mySecret={room.me?.secret || null}
          onAnswer={onAnswerQuestion}
        />
      )}

      {/* Guess Modal */}
      <GuessModal
        isOpen={showGuessModal}
        onClose={() => setShowGuessModal(false)}
        board={room.board}
        onConfirmGuess={onMakeGuess}
      />

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        history={room.history}
        myId={room.me?.socketId || ''}
      />

      {/* My Secret Full Details Modal */}
      {showMySecretModal && room.me?.secret && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
          onClick={() => setShowMySecretModal(false)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="yellow-plastic-frame p-2 rounded-2xl w-40 h-44 mx-auto shadow-xl">
              <div className="w-full h-full bg-white rounded-lg p-2 flex items-center justify-center">
                <img
                  src={room.me.secret.localImage || `/images/brainrots/${room.me.secret.id}.png`}
                  alt={room.me.secret.name}
                  className="w-full h-full object-contain filter drop-shadow"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/brainrots/placeholder.svg';
                  }}
                />
              </div>
            </div>

            <div>
              <span className="text-xs uppercase font-bold text-amber-300 bg-amber-400/20 px-3 py-1 rounded-full border border-amber-400/40">
                {room.me.secret.rarity}
              </span>
              <h3 className="text-xl font-extrabold text-white mt-2">
                {room.me.secret.name}
              </h3>
            </div>

            <div className="text-xs text-left bg-slate-950 p-4 rounded-2xl space-y-2 border border-slate-800 text-slate-300">
              <div className="flex justify-between">
                <span>Couleur dominante :</span>
                <span className="text-white font-bold">{room.me.secret.traits?.color}</span>
              </div>
              <div className="flex justify-between">
                <span>Catégorie :</span>
                <span className="text-white font-bold">{room.me.secret.traits?.type}</span>
              </div>
              <div className="flex justify-between">
                <span>Chapeau / Casque :</span>
                <span>{room.me.secret.traits?.hasHat ? '✅ Oui' : '❌ Non'}</span>
              </div>
              <div className="flex justify-between">
                <span>Animal :</span>
                <span>{room.me.secret.traits?.isAnimal ? '✅ Oui' : '❌ Non'}</span>
              </div>
              <div className="flex justify-between">
                <span>Nourriture :</span>
                <span>{room.me.secret.traits?.isFood ? '✅ Oui' : '❌ Non'}</span>
              </div>
            </div>

            <button
              onClick={() => setShowMySecretModal(false)}
              className="w-full py-3 rounded-xl btn-tactile-red text-white text-sm font-bold border border-red-400/40"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
