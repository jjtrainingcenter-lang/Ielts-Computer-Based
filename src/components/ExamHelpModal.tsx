import React, { useState } from 'react';
import { X, Info, Settings, MousePointer, Keyboard, Navigation } from 'lucide-react';

interface ExamHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExamHelpModal: React.FC<ExamHelpModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'navigation' | 'answering' | 'reviewing'>('general');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[80vh]">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-slate-800">
            <Info className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold">Examination Help & Instructions</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Tabs */}
          <div className="w-48 bg-slate-100 border-r border-slate-200 flex flex-col py-2">
            <TabButton 
              active={activeTab === 'general'} 
              onClick={() => setActiveTab('general')} 
              icon={<Info className="w-4 h-4" />} 
              label="General" 
            />
            <TabButton 
              active={activeTab === 'navigation'} 
              onClick={() => setActiveTab('navigation')} 
              icon={<Navigation className="w-4 h-4" />} 
              label="Navigation" 
            />
            <TabButton 
              active={activeTab === 'answering'} 
              onClick={() => setActiveTab('answering')} 
              icon={<MousePointer className="w-4 h-4" />} 
              label="Answering Questions" 
            />
            <TabButton 
              active={activeTab === 'reviewing'} 
              onClick={() => setActiveTab('reviewing')} 
              icon={<Keyboard className="w-4 h-4" />} 
              label="Reviewing" 
            />
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto text-sm text-slate-700 leading-relaxed">
            {activeTab === 'general' && (
              <div className="space-y-4">
                <h3 className="font-bold text-base text-slate-900">General Information</h3>
                <p>Welcome to the computer-delivered practice test. This environment simulates the official test experience.</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Timer:</strong> The timer at the top of the screen shows how much time you have remaining for the current section.</li>
                  <li><strong>Settings:</strong> You can adjust the text size and contrast using the Settings button in the header.</li>
                  <li><strong>Auto-Submit:</strong> When the timer reaches zero, your answers will be submitted automatically.</li>
                  <li><strong>Saving:</strong> Your answers are saved automatically as you type or click.</li>
                </ul>
              </div>
            )}
            
            {activeTab === 'navigation' && (
              <div className="space-y-4">
                <h3 className="font-bold text-base text-slate-900">Navigation</h3>
                <p>Use the navigation bar at the bottom of the screen to move between questions.</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Click <strong>Next</strong> or <strong>Previous</strong> to move one question at a time.</li>
                  <li>Click on a specific question number in the grid to jump directly to it.</li>
                  <li>In the Reading section, you can use the scrollbar to read the passage independently of the questions.</li>
                </ul>
              </div>
            )}

            {activeTab === 'answering' && (
              <div className="space-y-4">
                <h3 className="font-bold text-base text-slate-900">Answering Questions</h3>
                <p>Read the instructions for each question carefully.</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Multiple Choice:</strong> Click the radio button next to your chosen answer.</li>
                  <li><strong>Text Input:</strong> Click inside the box and type your answer. Pay attention to word count limits (e.g., "NO MORE THAN TWO WORDS").</li>
                  <li><strong>Writing:</strong> The word count is displayed automatically. The timer will continue while you switch between Task 1 and Task 2.</li>
                </ul>
              </div>
            )}

            {activeTab === 'reviewing' && (
              <div className="space-y-4">
                <h3 className="font-bold text-base text-slate-900">Reviewing & Tools</h3>
                <p>You have tools available to help you review your work.</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Mark for Review:</strong> Click the "Mark for Review" button if you want to come back to a question later. The question number will be highlighted in the navigation grid.</li>
                  <li><strong>Highlighting (Reading):</strong> Select text in the reading passage and click "Highlight" to mark important information.</li>
                  <li><strong>Notes (Reading):</strong> Select text and click "Notes" to add private notes for yourself.</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#214162] text-white font-bold text-sm rounded-lg hover:bg-[#1a334e] transition-colors"
          >
            Close Help
          </button>
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-3 px-4 py-3 text-sm font-semibold text-left transition-colors ${
      active ? 'bg-white text-blue-700 border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-200 border-l-4 border-transparent'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);
