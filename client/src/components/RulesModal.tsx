import React from 'react';
import { BookOpen, X, AlertTriangle } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl text-white">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Règles du Qui est-ce ? Brainrot
              </h2>
              <p className="text-xs text-slate-400">
                Inspiré du célèbre jeu de plateau avec l'univers Steal a Brainrot Roblox
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

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-3.5 text-xs sm:text-sm text-slate-200 leading-relaxed">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              1
            </div>
            <div>
              <h4 className="font-bold text-white mb-0.5">Le Personnage Secret</h4>
              <p className="text-slate-400 text-xs">
                Au début de la partie, 24 Brainrots sont tirés au sort. Chaque joueur reçoit un <b>Brainrot secret unique</b>. Ton adversaire doit deviner le tien, et tu dois deviner le sien.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              2
            </div>
            <div>
              <h4 className="font-bold text-white mb-0.5">Chacun son tour</h4>
              <p className="text-slate-400 text-xs">
                À ton tour, pose <b>une question</b> dont la réponse ne peut être que <b>« OUI »</b> ou <b>« NON »</b> (ex : <i>« Est-ce un animal ? »</i>, <i>« Est-il Mythique ? »</i>, <i>« Porte-t-il un chapeau ? »</i>).
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              3
            </div>
            <div>
              <h4 className="font-bold text-white mb-0.5">Faire basculer les fenêtres jaunes</h4>
              <p className="text-slate-400 text-xs">
                Clique sur une carte pour faire basculer sa fenêtre jaune vers le bas (elle devient grisée avec une croix). Les cartes basculées ne changent que <b>ton propre plateau</b> ; ton adversaire ne voit pas tes éliminations.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-red-300 mb-0.5">L'Accusation Finale (Deviner)</h4>
              <p className="text-slate-300 text-xs leading-normal">
                Pendant ton tour, clique sur <b>« DEVINER ! »</b> quand tu penses avoir trouvé.
                <br />
                • Si tu trouves juste : <b>tu gagnes immédiatement la partie !</b> 🎉
                <br />
                • Si tu te trompes : <b>tu perds instantanément la partie !</b> 💀
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl btn-tactile-blue text-white text-xs font-bold border border-blue-400/40"
          >
            C'est compris, jouer !
          </button>
        </div>
      </div>
    </div>
  );
};
