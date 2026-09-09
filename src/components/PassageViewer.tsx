import React, { useRef, useState } from 'react';
import { ReadingPassage, HighlightItem, DisplaySettings } from '../types';
import { ExamImageViewer } from './ExamImageViewer';
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
      setPopoverPos({ x: rect.left + rect.width / 2, y: rect.top - 5 });
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

  const handleAddNote = (noteContent: string) => {
    if (!selectedText) return;
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
      ? 'text-lg'
      : settings.fontSize === 'medium'
      ? 'text-[16px]'
      : 'text-[15px]';

  const renderHighlightedText = (text: string) => {
    if (!text) return null;

    const passageHighlights = highlights
      .filter((h) => h.passageId === currentPassage.id)
      .sort((a, b) => b.text.length - a.text.length);
    if (passageHighlights.length === 0) return text;

    let parts = [{ text, isHighlight: false, id: '', note: '' }];

    passageHighlights.forEach((highlight) => {
      const newParts: typeof parts = [];
      parts.forEach((part) => {
        if (part.isHighlight) {
          newParts.push(part);
          return;
        }

        let remainingText = part.text;
        const searchStr = highlight.text.toLowerCase();

        while (remainingText.length > 0) {
          const index = remainingText.toLowerCase().indexOf(searchStr);
          if (index === -1) {
            newParts.push({ text: remainingText, isHighlight: false, id: '', note: '' });
            break;
          }

          if (index > 0) {
            newParts.push({ text: remainingText.slice(0, index), isHighlight: false, id: '', note: '' });
          }
          newParts.push({
            text: remainingText.slice(index, index + highlight.text.length),
            isHighlight: true,
            id: highlight.id,
            note: highlight.note || '',
          });
          remainingText = remainingText.slice(index + highlight.text.length);
        }
      });
      parts = newParts.filter((p) => p.text.length > 0);
    });

    return (
      <>
        {parts.map((part, i) => {
          if (part.isHighlight) {
            return (
              <mark
                key={`${part.id}-${i}`}
                className="bg-yellow-200 text-black cursor-pointer rounded-sm hover:bg-yellow-300 relative group"
                onClick={() => {
                  if (window.confirm(part.note ? `Note: ${part.note}\n\nClear highlight?` : 'Clear highlight?')) {
                    onRemoveHighlight(part.id);
                  }
                }}
                title={part.note || 'Click to remove'}
              >
                {part.text}
                {part.note && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full border border-white" />
                )}
              </mark>
            );
          }
          return <span key={i}>{part.text}</span>;
        })}
      </>
    );
  };

  if (!currentPassage) return null;

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="shrink-0 px-10 pt-5 pb-3 border-b border-slate-200 bg-slate-50">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#214162]">
          Reading Passage {currentPassage.partNumber}
        </p>
        {currentPassage.subtitle && (
          <p className="text-xs text-slate-500 mt-1">{currentPassage.subtitle}</p>
        )}
      </div>

      <div
        ref={passageRef}
        onMouseUp={handleMouseUp}
        className={`flex-1 overflow-y-auto px-10 py-8 space-y-6 ${fontClass} text-black selection:bg-[#2060b2] selection:text-white ielts-scroll`}
      >
        <h3 className="text-xl font-bold text-black mb-4">{currentPassage.title}</h3>

        <div className="space-y-4">
          {currentPassage.paragraphs.map((p, idx) => {
            if (p.type === 'image' && p.imageUrl) {
              return (
                <div key={p.id || idx} className="my-6 flex flex-col items-center justify-center">
                  <ExamImageViewer imageUrl={p.imageUrl} imageAlt={p.alt || p.caption} imageZoomable={true} />
                  {p.caption && <p className="text-sm text-slate-500 mt-2 font-medium">{p.caption}</p>}
                </div>
              );
            }
            if (p.type === 'heading') {
              return (
                <h4 key={p.id || idx} className="text-lg font-bold text-black mt-6 mb-2">
                  {renderHighlightedText(p.text || '')}
                </h4>
              );
            }
            if (p.type === 'table') {
              return (
                <div key={p.id || idx} className="my-4 overflow-x-auto border border-slate-300 rounded">
                  <pre className="p-4 text-sm font-mono whitespace-pre-wrap text-black bg-slate-50">
                    {renderHighlightedText(p.text || '')}
                  </pre>
                </div>
              );
            }
            return (
              <p key={p.id || idx} className="text-black leading-relaxed text-left">
                {renderHighlightedText(p.text || '')}
              </p>
            );
          })}
        </div>
      </div>

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
