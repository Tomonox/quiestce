import React, { useState } from 'react';
import { RoomState, Brainrot } from '../types/game';
import { CharacterCard } from './CharacterCard';
import { QuestionModal } from './QuestionModal';
import { AnswerPrompt } from './AnswerPrompt';
import { GuessModal } from './GuessModal';
import { HistoryDrawer } from './HistoryDrawer';
import { HelpCircle, AlertTriangle, History, Search, RotateCcw, Eye, X } from 'lucide-react';

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
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6 animate-in fade-in duration-200">
      {/* Game Action Bar & Turn Status */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Turn indicator */}
        <div className="flex items-center gap-3">
          <div
            className={`px-4 py-2 rounded-xl text-sm sm:text-base font-extrabold flex items-center gap-2 border shadow-sm ${
              isMyTurn
                ? 'bg-amber-400 text-slate-950 border-amber-300'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <span>{isMyTurn ? '🎯 À TON TOUR !' : `⏳ TOUR DE ${room.opponent?.nickname || 'L\'ADVERSAIRE'}`}</span>
          </div>

          <span className="text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1 rounded-full">
            Tour #{room.turnNumber}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => setShowQuestionModal(true)}
            disabled={!isMyTurn || isAnswering}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl btn-tactile-blue text-white text-xs sm:text-sm font-bold border border-blue-400/40 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <HelpCircle className="w-4 h-4 stroke-[2.5]" />
            <span>POSER UNE QUESTION</span>
          </button>

          <button
            onClick={() => setShowGuessModal(true)}
            disabled={!isMyTurn || isAnswering}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl btn-tactile-red text-white text-xs sm:text-sm font-bold border border-red-400/40 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
            <span>DEVINER !</span>
          </button>

          <button
            onClick={() => setShowHistory(true)}
            title="Historique des questions"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            <History className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* The Physical Toy Game Tray Container */}
      <div className={`${trayClass} rounded-3xl p-4 sm:p-7 shadow-2xl relative space-y-5`}>
        {/* Tray Header Bar (Authentic Board Label + Counters) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-white/20 pb-3 text-white">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
              PLATEAU DE {room.me?.nickname} • {isBlueTray ? 'ÉQUIPE BLEUE' : 'ÉQUIPE ROUGE'}
            </span>
          </div>

          {/* Peg score markers & cards count */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 bg-black/35 px-3 py-1.5 rounded-full border border-white/20">
              <span className="text-amber-300 font-medium">Cartes actives :</span>
              <span className="font-bold text-white bg-amber-500/80 px-2 py-0.5 rounded">
                {remainingCount} / {totalCards}
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-black/35 px-3 py-1.5 rounded-full border border-white/20">
              <span className="text-slate-300 font-medium">{room.opponent?.nickname || 'Adversaire'} :</span>
              <span className="font-bold text-white">
                {room.opponent?.eliminatedCount || 0} éliminés
              </span>
            </div>
          </div>
        </div>

        {/* Quick Search & Trait Filters Bar */}
        <div className="bg-black/25 rounded-2xl p-2.5 flex flex-col sm:flex-row gap-2.5 items-center justify-between border border-white/10">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-300 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Chercher un Brainrot..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/95 text-slate-900 placeholder-slate-500 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs w-full sm:w-auto">
            {traitFilters.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTraitFilter(activeTraitFilter === t.id ? null : t.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap border transition-all ${
                  activeTraitFilter === t.id
                    ? 'bg-amber-400 text-slate-950 border-white shadow'
                    : 'bg-white/15 text-white border-white/20 hover:bg-white/25'
                }`}
              >
                {t.label}
              </button>
            ))}

            {myEliminated.length > 0 && (
              <button
                onClick={onResetEliminations}
                className="ml-auto text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-white px-3 py-1 rounded-lg border border-white flex items-center gap-1 shadow-sm transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Rétablir tout</span>
              </button>
            )}
          </div>
        </div>

        {/* The 24 Characters Grid (Clean 4 rows x 6 columns) */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3.5 pt-1">
          {filteredBoard.map((card) => {
            const isEliminated = myEliminated.includes(card.id);
            return (
              <CharacterCard
                key={card.id}
                card={card}
                isEliminated={isEliminated}
                onToggleEliminate={onToggleEliminate}
              />
            );
          })}
        </div>

        {/* The Authentic Front Slot: Player's Secret Mystery Card Stand */}
        <div className="pt-4 border-t border-white/20 flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="bg-black/40 rounded-2xl p-3 border border-amber-400/70 shadow-xl flex items-center gap-4 max-w-md w-full">
            {/* The Front Yellow Frame for the Secret Card */}
            <div className="yellow-plastic-frame rounded-xl p-1.5 shrink-0 shadow-lg w-20 sm:w-24">
              <div className="w-full aspect-[4/4.5] bg-white rounded border border-amber-300 p-1 flex items-center justify-center">
                {room.me?.secret ? (
                  <img
                    src={room.me.secret.localImage || `/images/brainrots/${room.me.secret.id}.png`}
                    alt={room.me.secret.name}
                    className="w-full h-full object-contain filter drop-shadow"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/brainrots/placeholder.svg';
                    }}
                  />
                ) : (
                  <span className="text-2xl">❓</span>
                )}
              </div>
              <div className="mt-1 py-0.5 bg-white rounded text-center">
                <span className="text-[10px] font-black text-slate-900 uppercase truncate block px-1">
                  {room.me?.secret?.name || 'Secret'}
                </span>
              </div>
            </div>

            {/* Secret Card Information */}
            <div className="flex-1 min-w-0 text-white space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-black/40 px-2 py-0.5 rounded border border-amber-400/40 inline-block">
                TON PERSONNAGE MYSTÈRE
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-white truncate">
                {room.me?.secret?.name}
              </h3>
              <p className="text-xs text-slate-200">
                Rareté : <b className="text-amber-300">{room.me?.secret?.rarity}</b> • Couleur : <b className="text-amber-300">{room.me?.secret?.traits?.color}</b>
              </p>
              <button
                onClick={() => setShowMySecretModal(true)}
                className="text-xs font-semibold text-amber-300 hover:text-white underline flex items-center gap-1 pt-0.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Voir toutes ses caractéristiques</span>
              </button>
            </div>
          </div>
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
