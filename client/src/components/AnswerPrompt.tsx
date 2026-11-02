import React from 'react';
import { QuestionHistoryItem, Brainrot } from '../types/game';
import { Check, X } from 'lucide-react';
import { audio } from '../utils/audio';

interface AnswerPromptProps {
  question: QuestionHistoryItem | null;
  mySecret: Brainrot | null;
  onAnswer: (answer: 'OUI' | 'NON') => void;
}

export const AnswerPrompt: React.FC<AnswerPromptProps> = ({
  question,
  mySecret,
  onAnswer
}) => {
  if (!question) return null;

  const handleAnswer = (ans: 'OUI' | 'NON') => {
    audio.playAnswer(ans === 'OUI');
    onAnswer(ans);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl text-white">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-xl">
            ❓
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              {question.askerName} te pose une question !
            </h2>
            <p className="text-xs text-slate-400">
              Catégorie : <span className="text-amber-400 font-semibold">{question.category}</span>
            </p>
          </div>
        </div>

        {/* Question Body */}
        <div className="p-5 sm:p-6 space-y-5">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              La question posée :
            </span>
            <p className="text-base sm:text-xl font-bold text-amber-300">
              « {question.text} »
            </p>
          </div>

          {/* Secret character helper card */}
          {mySecret && (
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3.5">
              <div className="yellow-plastic-frame p-1 rounded-lg w-14 h-16 shrink-0 shadow">
                <img
                  src={mySecret.localImage || `/images/brainrots/${mySecret.id}.png`}
                  alt={mySecret.name}
                  className="w-full h-full object-contain bg-white rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/brainrots/placeholder.svg';
                  }}
                />
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Ton personnage secret :
                </span>
                <h4 className="text-sm font-bold text-white truncate">
                  {mySecret.name} <span className="text-amber-300">({mySecret.rarity})</span>
                </h4>
                <div className="text-[11px] text-slate-300 flex flex-wrap gap-x-2.5 gap-y-0.5">
                  <span>Couleur: <b>{mySecret.traits?.color}</b></span>
                  <span>•</span>
                  <span>Chapeau: <b>{mySecret.traits?.hasHat ? 'Oui' : 'Non'}</b></span>
                  <span>•</span>
                  <span>Animal: <b>{mySecret.traits?.isAnimal ? 'Oui' : 'Non'}</b></span>
                </div>
              </div>
            </div>
          )}

          {/* Large tactile answer buttons */}
          <div className="grid grid-cols-2 gap-4 pt-1">
            <button
              onClick={() => handleAnswer('OUI')}
              className="py-4 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-lg font-black border border-emerald-400/40 shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transform active:scale-95 transition-all"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>OUI</span>
            </button>

            <button
              onClick={() => handleAnswer('NON')}
              className="py-4 px-6 rounded-xl btn-tactile-red text-white text-lg font-black border border-red-400/40 flex items-center justify-center gap-2 transform active:scale-95 transition-all"
            >
              <X className="w-5 h-5 stroke-[3]" />
              <span>NON</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
