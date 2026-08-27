import React from 'react';
import { TestSection } from '../types';
import { Headphones, BookOpen, FileEdit, Mic, Play } from 'lucide-react';

interface SectionIntroProps {
  section: TestSection;
  onStart: () => void;
}

export const SectionIntro: React.FC<SectionIntroProps> = ({ section, onStart }) => {
  const getSectionDetails = () => {
    switch (section) {
      case 'listening':
        return {
          title: 'Listening',
          icon: <Headphones className="w-10 h-10 text-indigo-600" />,
          bgColor: 'bg-indigo-50',
          borderColor: 'border-indigo-100',
          instructions: [
            'You will hear four parts.',
            'You will have time to read the questions before each part.',
            'The recording will play continuously according to the test configuration.',
            'The timer will start as soon as you click Start Section.'
          ]
        };
      case 'reading':
        return {
          title: 'Reading',
          icon: <BookOpen className="w-10 h-10 text-emerald-600" />,
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-100',
          instructions: [
            'You will read three passages and answer questions about each.',
            'You may highlight text and add notes.',
            'The timer will start as soon as you click Start Section.'
          ]
        };
      case 'writing':
        return {
          title: 'Writing',
          icon: <FileEdit className="w-10 h-10 text-amber-600" />,
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-100',
          instructions: [
            'You will complete two writing tasks.',
            'For Task 1, write at least 150 words.',
            'For Task 2, write at least 250 words.',
            'The timer will start as soon as you click Start Section.'
          ]
        };
      case 'speaking':
        return {
          title: 'Speaking',
          icon: <Mic className="w-10 h-10 text-purple-600" />,
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-100',
          instructions: [
            'This is a Speaking assessment module.',
            'Normally, Speaking is conducted separately with an examiner.'
          ]
        };
      default:
        return {
          title: section,
          icon: null,
          bgColor: 'bg-slate-50',
          borderColor: 'border-slate-200',
          instructions: []
        };
    }
  };

  const details = getSectionDetails();

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 p-8 h-full w-full absolute inset-0 z-50">
      <div className={`max-w-xl w-full bg-white rounded-2xl shadow-xl border ${details.borderColor} p-8 space-y-8 text-center`}>
        <div className={`mx-auto w-20 h-20 ${details.bgColor} rounded-full flex items-center justify-center`}>
          {details.icon}
        </div>
        
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight capitalize">{details.title}</h2>
          <p className="text-slate-500 mt-1 text-sm font-semibold uppercase tracking-widest">Section Instructions</p>
        </div>

        <div className="text-left bg-slate-50 border border-slate-200 rounded-xl p-6">
          <ul className="space-y-3">
            {details.instructions.map((inst, i) => (
              <li key={i} className="flex items-start space-x-3 text-slate-700 text-sm">
                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500 mt-2" />
                <span className="leading-relaxed">{inst}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-center">
          <button
            onClick={onStart}
            className="px-8 py-3.5 bg-[#214162] hover:bg-[#1a334e] text-white font-bold rounded-xl shadow-md transition-all text-sm flex items-center space-x-2"
          >
            <span>Start {details.title}</span>
            <Play className="w-4 h-4 fill-white" />
          </button>
        </div>
      </div>
    </div>
  );
};
