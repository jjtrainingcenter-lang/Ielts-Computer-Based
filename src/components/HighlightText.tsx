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

  // Gather active highlights - matching words and phrases globally across the exam
  const validHighlights = (highlights || [])
    .filter((h) => h && h.text && h.text.trim().length > 0)
    .sort((a, b) => b.text.trim().length - a.text.trim().length);

  if (validHighlights.length === 0) return <>{text}</>;

  interface Interval {
    start: number;
    end: number;
    id: string;
    color: string;
    note?: string;
    text: string;
  }

  const intervals: Interval[] = [];
  const claimed = new Uint8Array(text.length);
  const lowerText = text.toLowerCase();

  for (const h of validHighlights) {
    const targetText = h.text.trim();
    const targetLen = targetText.length;
    if (targetLen === 0) continue;
    const targetLower = targetText.toLowerCase();

    // Match all occurrences of this word/phrase in the text
    let pos = 0;
    while (pos < lowerText.length) {
      const idx = lowerText.indexOf(targetLower, pos);
      if (idx === -1) break;

      let conflict = false;
      const end = idx + targetLen;
      for (let k = idx; k < end; k++) {
        if (claimed[k]) {
          conflict = true;
          break;
        }
      }

      if (!conflict) {
        for (let k = idx; k < end; k++) {
          claimed[k] = 1;
        }
        intervals.push({
          start: idx,
          end,
          id: h.id,
          color: (h.color as string) || 'yellow',
          note: h.note,
          text: text.slice(idx, end),
        });
      }

      pos = idx + Math.max(1, targetLen);
    }
  }

  if (intervals.length === 0) return <>{text}</>;

  intervals.sort((a, b) => a.start - b.start);

  const parts: { text: string; isHighlight: boolean; id?: string; color?: string; note?: string }[] = [];
  let cursor = 0;
  for (const item of intervals) {
    if (item.start > cursor) {
      parts.push({ text: text.slice(cursor, item.start), isHighlight: false });
    }
    parts.push({
      text: item.text,
      isHighlight: true,
      id: item.id,
      color: item.color,
      note: item.note,
    });
    cursor = item.end;
  }
  if (cursor < text.length) {
    parts.push({ text: text.slice(cursor), isHighlight: false });
  }

  const activeHighlight = activeHighlightId
    ? validHighlights.find((h) => h.id === activeHighlightId)
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
