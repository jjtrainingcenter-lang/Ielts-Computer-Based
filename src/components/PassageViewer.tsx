import React, { useRef, useState } from 'react';
import { ReadingPassage, HighlightItem, DisplaySettings } from '../types';
import { TextHighlighterPopover } from './TextHighlighterPopover';

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
  highlights,
  onAddHighlight,
  onRemoveHighlight,
  settings,
}) => {
  const currentPassage = passages.find((p) => p.id === activePassageId) || passages[0];
  const passageRef = useRef<HTMLDivElement>(null);
  const [selectedText, setSelectedText] = useState('');
  const [popoverPos, setPopoverPos] = useState<{ x: number; y: number } | null>(null);
  
  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setSelectedText('');
      setPopoverPos(null);
      return;
    }
    const text = selection.toString().trim();
    if (text.length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectedText(text);
      setPopoverPos({
        x: rect.left + rect.width / 2,
        y: rect.top - 5,
      });
    }
  };

  const handleApplyHighlight = () => {
    if (!selectedText) return;
    onAddHighlight({
      passageId: currentPassage.id,
      text: selectedText,
      color: 'yellow',
    });
    setSelectedText('');
    setPopoverPos(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleAddNote = () => {
    if (!selectedText) return;
    const noteContent = prompt('Add note:', '');
    if (noteContent !== null) {
      onAddHighlight({
        passageId: currentPassage.id,
        text: selectedText,
        color: 'yellow',
        note: noteContent || 'Passage note',
      });
    }
    setSelectedText('');
    setPopoverPos(null);
    window.getSelection()?.removeAllRanges();
  };

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
        onMouseUp={handleMouseUp}
        className={`flex-1 overflow-y-auto px-10 py-8 space-y-6 ${fontClass} text-black selection:bg-[#2060b2] selection:text-white ielts-scroll`}
      >
        <h3 className="text-xl font-bold text-black mb-4">
          {currentPassage.title}
        </h3>
        
        {/* Paragraphs */}
        <div className="space-y-4">
          {currentPassage.paragraphs.map((p, idx) => (
            <p key={p.id || idx} className="text-black text-[15px] leading-relaxed text-left">
              {p.text}
            </p>
          ))}
        </div>
      </div>
      
      {/* Floating Text Highlighter Popover */}
      {popoverPos && (
        <TextHighlighterPopover
          x={popoverPos.x}
          y={popoverPos.y}
          onHighlight={handleApplyHighlight}
          onAddNote={handleAddNote}
          onClose={() => {
             setSelectedText('');
             setPopoverPos(null);
             window.getSelection()?.removeAllRanges();
          }}
        />
      )}
    </div>
  );
};
