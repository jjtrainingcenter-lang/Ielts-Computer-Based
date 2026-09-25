import React, { useRef, useState } from 'react';
import { ReadingPassage, HighlightItem, DisplaySettings } from '../types';
import { ExamImageViewer } from './ExamImageViewer';
import { TextHighlighterPopover } from './TextHighlighterPopover';
import { HighlightActionPopover } from './HighlightActionPopover';
import { HighlightPaletteBar } from './HighlightPaletteBar';
import {
  HighlightColor,
  getHighlightMarkClass,
  getStoredHighlightColor,
  setStoredHighlightColor,
} from '../lib/highlightColors';

interface PassageViewerProps {
  passages: ReadingPassage[];
  activePassageId: string;
  onSelectPassage: (id: string) => void;
  highlights: HighlightItem[];
  onAddHighlight: (highlight: Omit<HighlightItem, 'id' | 'createdAt'>) => void;
  onRemoveHighlight: (id: string) => void;
  onUpdateHighlight?: (id: string, updates: Partial<HighlightItem>) => void;
  settings: DisplaySettings;
}

export const PassageViewer: React.FC<PassageViewerProps> = ({
  passages,
  activePassageId,
  highlights,
  onAddHighlight,
  onRemoveHighlight,
  onUpdateHighlight,
  settings,
}) => {
  const currentPassage = passages.find((p) => p.id === activePassageId) || passages[0];
  const passageRef = useRef<HTMLDivElement>(null);
  const [selectedText, setSelectedText] = useState('');
  const [popoverPos, setPopoverPos] = useState<{ x: number; y: number } | null>(null);
  const [activeHighlightColor, setActiveHighlightColor] = useState<HighlightColor>(getStoredHighlightColor);
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null);
  const [actionPos, setActionPos] = useState<{ x: number; y: number } | null>(null);

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      return;
    }
    const text = selection.toString().trim();
    if (text.length > 0) {
      try {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelectedText(text);
        setPopoverPos({ x: rect.left + rect.width / 2, y: rect.top - 8 });
      } catch (e) {}
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      const text = selection.toString().trim();
      if (text.length > 0) {
        e.preventDefault();
        setSelectedText(text);
        setPopoverPos({ x: e.clientX, y: e.clientY - 10 });
      }
    }
  };

  const handleApplyHighlight = (color?: HighlightColor, textToHighlight?: string) => {
    const targetText = (textToHighlight || selectedText || '').trim();
    if (!targetText) return;
    const resolvedColor = color || activeHighlightColor;

    // Support single and multi-line selections seamlessly
    const segments = targetText
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    segments.forEach((seg) => {
      onAddHighlight({
        passageId: currentPassage.id,
        text: seg,
        color: resolvedColor,
      });
    });

    setSelectedText('');
    setPopoverPos(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleAddNote = (noteContent: string, color?: HighlightColor) => {
    if (!selectedText) return;
    const resolvedColor = color || activeHighlightColor;
    
    const segments = selectedText
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    segments.forEach((seg, idx) => {
      onAddHighlight({
        passageId: currentPassage.id,
        text: seg,
        color: resolvedColor,
        note: idx === 0 ? (noteContent || 'Passage note') : undefined,
      });
    });

    setSelectedText('');
    setPopoverPos(null);
    window.getSelection()?.removeAllRanges();
  };

  const handlePaletteColorChange = (col: HighlightColor) => {
    setActiveHighlightColor(col);
    setStoredHighlightColor(col);
    // If text is currently selected, highlight it immediately with the chosen color!
    const selection = window.getSelection();
    const currentSelText = selection ? selection.toString().trim() : '';
    if (currentSelText.length > 0) {
      handleApplyHighlight(col, currentSelText);
    } else if (selectedText.length > 0) {
      handleApplyHighlight(col, selectedText);
    }
  };

  const fontClass =
    settings.fontSize === 'large'
      ? 'text-lg'
      : settings.fontSize === 'medium'
      ? 'text-[16px]'
      : 'text-[15px]';

  const passageHighlights = (highlights || [])
    .filter((h) => h.passageId === currentPassage?.id)
    .sort((a, b) => b.text.length - a.text.length);

  const activeHighlight = activeHighlightId
    ? passageHighlights.find((h) => h.id === activeHighlightId)
    : null;

  const renderHighlightedText = (text: string) => {
    if (!text) return null;
    if (passageHighlights.length === 0) return text;

    interface TextChunk {
      text: string;
      isHighlight: boolean;
      id: string;
      note: string;
      color: string;
    }

    let parts: TextChunk[] = [{ text, isHighlight: false, id: '', note: '', color: '' }];

    passageHighlights.forEach((highlight) => {
      const newParts: TextChunk[] = [];
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
            newParts.push({ text: remainingText, isHighlight: false, id: '', note: '', color: '' });
            break;
          }

          if (index > 0) {
            newParts.push({ text: remainingText.slice(0, index), isHighlight: false, id: '', note: '', color: '' });
          }
          newParts.push({
            text: remainingText.slice(index, index + highlight.text.length),
            isHighlight: true,
            id: highlight.id,
            note: highlight.note || '',
            color: highlight.color || 'yellow',
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
            const markClass = getHighlightMarkClass(part.color);
            return (
              <mark
                key={`${part.id}-${i}`}
                className={`${markClass} cursor-pointer rounded-xs px-0.5 py-0.2 relative group select-text inline transition-colors`}
                onClick={(e) => {
                  e.stopPropagation();
                  const rect = e.currentTarget.getBoundingClientRect();
                  setActiveHighlightId(part.id);
                  setActionPos({ x: rect.left + rect.width / 2, y: rect.top - 5 });
                }}
                title={part.note ? `Note: ${part.note} (Click to manage)` : 'Click to change color or remove'}
              >
                {part.text}
                {part.note && (
                  <span
                    className="inline-block w-2 h-2 ml-0.5 align-top bg-blue-600 rounded-full border border-white shadow-2xs"
                    title={`Note: ${part.note}`}
                  />
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
      <div className="shrink-0 px-8 sm:px-10 pt-4 pb-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#214162]">
            Reading Passage {currentPassage.partNumber}
          </p>
          {currentPassage.subtitle && (
            <p className="text-xs text-slate-500 mt-0.5">{currentPassage.subtitle}</p>
          )}
        </div>

        {/* Color Palette bar */}
        <HighlightPaletteBar
          activeColor={activeHighlightColor}
          onChangeColor={handlePaletteColorChange}
          highlightCount={passageHighlights.length}
        />
      </div>

      <div
        ref={passageRef}
        onMouseUp={handleMouseUp}
        onContextMenu={handleContextMenu}
        className={`flex-1 overflow-y-auto px-8 sm:px-10 py-8 space-y-6 ${fontClass} text-black select-text selection:bg-[#2060b2] selection:text-white ielts-scroll`}
      >
        <h3 className="text-xl font-bold text-black mb-4 select-text">
          {renderHighlightedText(currentPassage.title)}
        </h3>

        <div className="space-y-4 select-text">
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
          defaultColor={activeHighlightColor}
          onHighlight={(color) => handleApplyHighlight(color)}
          onAddNote={(color, note) => handleAddNote(note || 'Passage note', color)}
          onClose={() => {
            setSelectedText('');
            setPopoverPos(null);
            window.getSelection()?.removeAllRanges();
          }}
        />
      )}

      {activeHighlight && actionPos && (
        <HighlightActionPopover
          x={actionPos.x}
          y={actionPos.y}
          currentColor={activeHighlight.color}
          note={activeHighlight.note}
          onChangeColor={(newColor: HighlightColor) => {
            if (onUpdateHighlight) {
              onUpdateHighlight(activeHighlight.id, { color: newColor });
            }
            setActiveHighlightId(null);
            setActionPos(null);
          }}
          onSaveNote={(newNote: string) => {
            if (onUpdateHighlight) {
              onUpdateHighlight(activeHighlight.id, { note: newNote });
            }
            setActiveHighlightId(null);
            setActionPos(null);
          }}
          onRemove={() => {
            onRemoveHighlight(activeHighlight.id);
            setActiveHighlightId(null);
            setActionPos(null);
          }}
          onClose={() => {
            setActiveHighlightId(null);
            setActionPos(null);
          }}
        />
      )}
    </div>
  );
};
