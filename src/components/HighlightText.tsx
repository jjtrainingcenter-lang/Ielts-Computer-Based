import React, { useState } from 'react';
import { HighlightItem } from '../types';

interface HighlightTextProps {
  text: string;
  contextId: string;
  highlights: HighlightItem[];
  onRemoveHighlight: (id: string) => void;
}

export const HighlightText: React.FC<HighlightTextProps> = ({
  text,
  contextId,
  highlights,
  onRemoveHighlight,
}) => {
  if (!text) return null;

  const passageHighlights = highlights
    .filter((h) => h.passageId === contextId)
    .sort((a, b) => b.text.length - a.text.length);

  if (passageHighlights.length === 0) return <>{text}</>;

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
              onClick={(e) => {
                e.stopPropagation();
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
        return <React.Fragment key={`text-${i}`}>{part.text}</React.Fragment>;
      })}
    </>
  );
};
