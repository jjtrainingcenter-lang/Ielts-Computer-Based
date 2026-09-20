import React, { useState } from 'react';
import { HighlightItem } from '../types';
import { getHighlightMarkClass, HighlightColor } from '../lib/highlightColors';
import { HighlightActionPopover } from './HighlightActionPopover';

interface HighlightTextProps {
  text: string;
  contextId: string;
  highlights: HighlightItem[];
  onRemoveHighlight: (id: string) => void;
  onUpdateHighlight?: (id: string, updates: Partial<HighlightItem>) => void;
}

export const HighlightText: React.FC<HighlightTextProps> = ({
  text,
  contextId,
  highlights,
  onRemoveHighlight,
  onUpdateHighlight,
}) => {
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null);
  const [actionPos, setActionPos] = useState<{ x: number; y: number } | null>(null);

  if (!text) return null;

  // Match highlights for this context
  const passageHighlights = (highlights || [])
    .filter((h) => {
      if (h.passageId === contextId) return true;
      if (
        (contextId === 'questions' || contextId === 'reading_questions' || contextId === 'listening_questions') &&
        (h.passageId === 'questions' || h.passageId === 'reading_questions' || h.passageId === 'listening_questions')
      ) {
        return true;
      }
      return false;
    })
    .sort((a, b) => b.text.length - a.text.length);

  if (passageHighlights.length === 0) return <>{text}</>;

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

  const activeHighlight = activeHighlightId
    ? passageHighlights.find((h) => h.id === activeHighlightId)
    : null;

  return (
    <>
      {parts.map((part, i) => {
        if (part.isHighlight) {
          const markClass = getHighlightMarkClass(part.color);
          return (
            <mark
              key={`${part.id}-${i}`}
              className={`${markClass} cursor-pointer rounded-xs px-0.5 py-0.2 relative group transition-colors select-text inline`}
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
        return <React.Fragment key={`text-${i}`}>{part.text}</React.Fragment>;
      })}

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
    </>
  );
};
