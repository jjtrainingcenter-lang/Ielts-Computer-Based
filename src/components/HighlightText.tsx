import React, { useState } from 'react';
import { HighlightItem } from '../types';
import { getHighlightMarkClass } from '../lib/highlightColors';
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

  // Filter highlights strictly for this specific context (e.g. question_4, block_instructions, etc.)
  const contextHighlights = (highlights || []).filter((h) => {
    if (!h || !h.text) return false;
    return h.passageId === contextId;
  });

  if (contextHighlights.length === 0) return <>{text}</>;

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

  // Sort highlights by length descending to match longer phrases first
  const sorted = [...contextHighlights].sort(
    (a, b) => b.text.trim().length - a.text.trim().length
  );

  for (const h of sorted) {
    const targetText = h.text.trim();
    const targetLen = targetText.length;
    if (targetLen === 0) continue;
    const targetLower = targetText.toLowerCase();

    let matchedStart = -1;

    // 1. Try matching with startOffset & endOffset if valid and unclaimed
    if (
      h.startOffset !== undefined &&
      h.startOffset >= 0 &&
      h.startOffset + targetLen <= text.length
    ) {
      const candidateSub = text.slice(h.startOffset, h.startOffset + targetLen).toLowerCase();
      if (candidateSub === targetLower) {
        let isFree = true;
        for (let k = h.startOffset; k < h.startOffset + targetLen; k++) {
          if (claimed[k]) {
            isFree = false;
            break;
          }
        }
        if (isFree) {
          matchedStart = h.startOffset;
        }
      }
    }

    // 2. If not matched by offset, try matching with prefix context
    if (matchedStart === -1 && h.prefix) {
      const prefixLower = h.prefix.slice(-15).toLowerCase();
      let searchIdx = 0;
      while (searchIdx < lowerText.length) {
        const foundIdx = lowerText.indexOf(targetLower, searchIdx);
        if (foundIdx === -1) break;
        const textBefore = lowerText.slice(Math.max(0, foundIdx - prefixLower.length), foundIdx);
        if (textBefore.endsWith(prefixLower)) {
          let isFree = true;
          for (let k = foundIdx; k < foundIdx + targetLen; k++) {
            if (claimed[k]) {
              isFree = false;
              break;
            }
          }
          if (isFree) {
            matchedStart = foundIdx;
            break;
          }
        }
        searchIdx = foundIdx + 1;
      }
    }

    // 3. Fallback: match the first unclaimed occurrence of targetText in this text
    if (matchedStart === -1) {
      let searchIdx = 0;
      while (searchIdx < lowerText.length) {
        const foundIdx = lowerText.indexOf(targetLower, searchIdx);
        if (foundIdx === -1) break;
        let isFree = true;
        for (let k = foundIdx; k < foundIdx + targetLen; k++) {
          if (claimed[k]) {
            isFree = false;
            break;
          }
        }
        if (isFree) {
          matchedStart = foundIdx;
          break;
        }
        searchIdx = foundIdx + 1;
      }
    }

    // If an unclaimed occurrence was found, claim it for this highlight item
    // NOTE: Only ONE occurrence is claimed per highlight item!
    if (matchedStart !== -1) {
      const matchedEnd = matchedStart + targetLen;
      for (let k = matchedStart; k < matchedEnd; k++) {
        claimed[k] = 1;
      }
      intervals.push({
        start: matchedStart,
        end: matchedEnd,
        id: h.id,
        color: (h.color as string) || 'yellow',
        note: h.note,
        text: text.slice(matchedStart, matchedEnd),
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
    ? contextHighlights.find((h) => h.id === activeHighlightId)
    : null;

  return (
    <>
      {parts.map((part, i) => {
        if (part.isHighlight && part.id) {
          const markClass = getHighlightMarkClass(part.color);
          return (
            <mark
              key={`${part.id}-${i}`}
              className={`${markClass} cursor-pointer rounded-xs px-0.5 py-0.2 relative group select-text inline transition-colors`}
              onClick={(e) => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                setActionPos({
                  x: rect.left + rect.width / 2,
                  y: rect.top - 8,
                });
                setActiveHighlightId(part.id!);
              }}
              title={part.note ? `Note: ${part.note}` : 'Click to edit or remove highlight'}
            >
              {part.text}
              {part.note && (
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-600 align-top ml-0.5" />
              )}
            </mark>
          );
        }
        return <span key={i}>{part.text}</span>;
      })}

      {activeHighlight && actionPos && (
        <HighlightActionPopover
          x={actionPos.x}
          y={actionPos.y}
          currentColor={activeHighlight.color}
          note={activeHighlight.note}
          onChangeColor={(col) => {
            if (onUpdateHighlight) {
              onUpdateHighlight(activeHighlight.id, { color: col });
            }
            setActiveHighlightId(null);
            setActionPos(null);
          }}
          onSaveNote={(note) => {
            if (onUpdateHighlight) {
              onUpdateHighlight(activeHighlight.id, { note });
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
