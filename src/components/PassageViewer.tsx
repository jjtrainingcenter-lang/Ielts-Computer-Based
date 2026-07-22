import React, { useRef, useState } from 'react';
import { ReadingPassage, HighlightItem, DisplaySettings } from '../types';

interface PassageViewerProps {
  passages: ReadingPassage[];
  activePassageId: string;
  onSelectPassage: (id: string) => void;
  highlights: HighlightItem[];
  onAddHighlight: (highlight: Omit<HighlightItem, 'id' | 'createdAt'>) => void;
  onRemoveHighlight: (id: string) => void;
  settings: DisplaySettings;
}

export const PassageViewer: React.FC<PassageViewerProps> = ({
  passages,
  activePassageId,
  onSelectPassage,
  settings,
}) => {
  const currentPassage = passages.find((p) => p.id === activePassageId) || passages[0];
  const passageRef = useRef<HTMLDivElement>(null);

  const fontClass =
    settings.fontSize === 'large'
      ? 'text-lg leading-relaxed'
      : settings.fontSize === 'medium'
      ? 'text-[16px] leading-relaxed'
      : 'text-[15px] leading-relaxed';

  if (!currentPassage) return null;

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Main Passage Text Body */}
      <div
        ref={passageRef}
        className={`flex-1 overflow-y-auto px-10 py-8 space-y-6 ${fontClass} text-black selection:bg-blue-200`}
      >
        <h3 className="text-xl font-bold text-black mb-4">
          {currentPassage.title}
        </h3>
        
        {/* Paragraphs */}
        <div className="space-y-4">
          {currentPassage.paragraphs.map((p, idx) => (
            <p key={p.id || idx} className="text-black text-[15px] leading-relaxed text-left">
              {/* If p.id is a letter like A, B, C, we might display it, but usually it's just part of the text if needed. For now, just standard paragraph. */}
              {p.text}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};
