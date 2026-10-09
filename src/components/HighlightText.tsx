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
      if (!h || !h.text) return false;
      if (h.passageId === contextId) return true;
      // Reading questions: allow matching legacy 'questions'
      if (
        (contextId === 'reading_questions' && h.passageId === 'questions') ||
        (contextId === 'questions' && h.passageId === 'reading_questions')
      ) {
        return true;
      }
      // Writing contexts: allow matching writing_1, writing_2, or writing
      if (contextId.startsWith('writing') && h.passageId && h.passageId.startsWith('writing')) {
        return h.passageId === contextId || h.passageId === 'writing';
      }
      return false;
    })
    .sort((a, b) => b.text.length - a.text.length);

  if (passageHighlights.length === 0) return <>{text}</>;

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

  for (const h of passageHighlights) {
    const targetText = h.text;
    const targetLen = targetText.length;
    if (targetLen === 0) continue;

    let matchedStart = -1;

    // 1. Try exact startOffset if saved
    if (
      typeof h.startOffset === 'number' &&
      h.startOffset >= 0 &&
      h.startOffset + targetLen <= text.length
    ) {
      const slice = text.slice(h.startOffset, h.startOffset + targetLen);
      if (slice.toLowerCase() === targetText.toLowerCase()) {
        let conflict = false;
        for (let k = h.startOffset; k < h.startOffset + targetLen; k++) {
          if (claimed[k]) {
            conflict = true;
            break;
          }
        }
        if (!conflict) {
          matchedStart = h.startOffset;
        }
      }
    }

    // 2. Disambiguate with prefix / suffix
    if (matchedStart === -1 && (h.prefix || h.suffix)) {
      let pos = 0;
      let bestScore = 0;
      let bestPos = -1;
      while (pos < text.length) {
        const idx = text.toLowerCase().indexOf(targetText.toLowerCase(), pos);
        if (idx === -1) break;
        let score = 0;
        if (h.prefix) {
          const actualPre = text.slice(Math.max(0, idx - h.prefix.length), idx);
          if (actualPre.toLowerCase() === h.prefix.toLowerCase()) score += 2;
        }
        if (h.suffix) {
          const actualSuf = text.slice(idx + targetLen, idx + targetLen + h.suffix.length);
          if (actualSuf.toLowerCase() === h.suffix.toLowerCase()) score += 2;
        }
        if (score > bestScore) {
          let conflict = false;
          for (let k = idx; k < idx + targetLen; k++) {
            if (claimed[k]) {
              conflict = true;
              break;
            }
          }
          if (!conflict) {
            bestScore = score;
            bestPos = idx;
          }
        }
        pos = idx + 1;
      }
      if (bestPos !== -1) {
        matchedStart = bestPos;
      }
    }

    // 3. Fallback: match first unclaimed occurrence (never highlight all occurrences!)
    if (matchedStart === -1) {
      let pos = 0;
      while (pos < text.length) {
        const idx = text.toLowerCase().indexOf(targetText.toLowerCase(), pos);
        if (idx === -1) break;
        let conflict = false;
        for (let k = idx; k < idx + targetLen; k++) {
          if (claimed[k]) {
            conflict = true;
            break;
          }
        }
        if (!conflict) {
          matchedStart = idx;
          break;
        }
        pos = idx + 1;
      }
    }

    if (matchedStart !== -1) {
      for (let k = matchedStart; k < matchedStart + targetLen; k++) {
        claimed[k] = 1;
      }
      intervals.push({
        start: matchedStart,
        end: matchedStart + targetLen,
        id: h.id,
        color: h.color || 'yellow',
        note: h.note,
        text: text.slice(matchedStart, matchedStart + targetLen),
      });
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
