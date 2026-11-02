import React, { useState } from 'react';
import { HelpCircle, MessageSquare, Send, X, Palette, Crown, Feather, Utensils } from 'lucide-react';
import { audio } from '../utils/audio';

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendQuestion: (category: string, questionText: string) => void;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({
  isOpen,
  onClose,
  onSendQuestion
}) => {
  const [activeTab, setActiveTab] = useState<'preset' | 'custom'>('preset');
  const [presetCategory, setPresetCategory] = useState<string>('rarete');
  const [customText, setCustomText] = useState<string>('');

  if (!isOpen) return null;

  const presetQuestions = {
    rarete: {
      label: 'Rareté',
      icon: Crown,
      questions: [
        'Est-ce que ton Brainrot est de rareté Common ?',
        'Est-ce que ton Brainrot est de rareté Rare ?',
        'Est-ce que ton Brainrot est de rareté Epic ?',
        'Est-ce que ton Brainrot est de rareté Legendary ?',
        'Est-ce que ton Brainrot est de rareté Mythic ?',
        'Est-ce que ton Brainrot est de rareté Secret ?',
        'Est-ce que ton Brainrot est un OG ou Brainrot God ?'
      ]
    },
    nature: {
      label: 'Espèce & Nature',
      icon: Utensils,
      questions: [
        'Est-ce que ton Brainrot est un animal ?',
        'Est-ce que ton Brainrot est de la nourriture (fruit, pizza...) ?',
        'Est-ce un hybride animal et nourriture ?',
        'Est-ce un groupe de plusieurs personnages (famille, duo) ?',
        'Est-ce un véhicule ou un robot ?'
      ]
    },
    couleur: {
      label: 'Couleur',
      icon: Palette,
      questions: [
        'Est-ce que sa couleur principale est le Bleu ?',
        'Est-ce que sa couleur principale est le Rouge ou Rose ?',
        'Est-ce que sa couleur principale est le Vert ?',
        'Est-ce que sa couleur principale est le Jaune ou Doré ?',
        'Est-ce que sa couleur principale est le Blanc ?',
        'Est-ce que sa couleur principale est le Noir ?',
        'Est-ce que son design est multicolore ?'
      ]
    },
    accessoires: {
      label: 'Accessoires & Traits',
      icon: Feather,
      questions: [
        'Est-ce qu\'il porte un chapeau, casque ou couronne ?',
        'Est-ce qu\'il porte des lunettes ou un masque ?',
        'Est-ce qu\'il possède une arme, lame ou bombe ?',
        'Est-ce qu\'il a des ailes ou peut voler ?',
        'Est-ce que son nom sonne italien (termine par -i ou -a) ?'
      ]
    }
  };

  const handleSelectPreset = (q: string) => {
    audio.playQuestionAsked();
    const catLabel = presetQuestions[presetCategory as keyof typeof presetQuestions]?.label || 'Général';
    onSendQuestion(catLabel, q);
    onClose();
  };

  const handleSendCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    audio.playQuestionAsked();
    onSendQuestion('Personnalisée', customText.trim());
    setCustomText('');
    onClose();
  };

  const currentCategoryData = presetQuestions[presetCategory as keyof typeof presetQuestions];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Poser une question
              </h2>
              <p className="text-xs text-slate-400">
                L'adversaire ne pourra répondre que par « OUI » ou « NON »
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

        {/* Tab switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-1.5 gap-1.5">
          <button
            onClick={() => setActiveTab('preset')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'preset'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Questions suggérées
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'custom'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Question personnalisée
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {activeTab === 'preset' ? (
            <div className="space-y-4">
              {/* Category Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(presetQuestions).map(([key, data]) => {
                  const Icon = data.icon;
                  const isSelected = presetCategory === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setPresetCategory(key)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        isSelected
                          ? 'bg-blue-600 border-blue-400 text-white shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{data.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Questions List */}
              <div className="space-y-2 pt-2">
                {currentCategoryData.questions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectPreset(q)}
                    className="w-full text-left p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-400/80 hover:bg-slate-800/60 transition-all text-xs sm:text-sm font-medium text-slate-200 hover:text-white flex items-center justify-between group"
                  >
                    <span>« {q} »</span>
                    <Send className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors ml-2 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSendCustom} className="space-y-4">
              <div>
                <label htmlFor="custom-question-input" className="block text-xs font-semibold text-slate-300 mb-2">
                  Écris ta question à poser à l'adversaire :
                </label>
                <textarea
                  id="custom-question-input"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Ex: Est-ce que ton personnage a des yeux rouges ?"
                  maxLength={120}
                  rows={3}
                  className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 resize-none"
                />
                <span className="text-[11px] text-slate-500 block text-right mt-1">
                  {customText.length} / 120 caractères
                </span>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs text-slate-400">
                <b className="text-amber-400">Rappel :</b> La question doit obligatoirement pouvoir se répondre par « OUI » ou « NON ».
              </div>

              <button
                type="submit"
                disabled={!customText.trim()}
                className="w-full py-3.5 rounded-xl btn-tactile-blue text-white text-sm font-bold border border-blue-400/40 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Envoyer la question</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
