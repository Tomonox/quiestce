import React from 'react';
import { QuestionHistoryItem } from '../types/game';
import { History, X, Check, XCircle } from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: QuestionHistoryItem[];
  myId: string;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  myId
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">
              Historique de la partie
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs">
              <span className="text-3xl block mb-2">📜</span>
              Aucune question n'a encore été posée dans cette partie.
            </div>
          ) : (
            history.map((item, idx) => {
              const isMyQuestion = item.askerId === myId;
              const isYes = item.answer === 'OUI';
              return (
                <div
                  key={item.id || idx}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">
                      #{idx + 1} • {isMyQuestion ? 'Toi' : item.askerName}
                    </span>
                    <span className="text-slate-400 text-[10px] bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                      {item.category}
                    </span>
                  </div>

                  <p className="text-xs text-white font-medium pl-2 border-l-2 border-amber-400/70">
                    « {item.text} »
                  </p>

                  <div className="flex justify-end pt-1">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        isYes
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : 'bg-red-950 text-red-300 border border-red-500/40'
                      }`}
                    >
                      {isYes ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <XCircle className="w-3.5 h-3.5 stroke-[3]" />}
                      <span>{item.answer || 'En attente...'}</span>
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
