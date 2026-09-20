import React, { useState, useRef } from 'react';
import { HighlightItem } from '../types';
import { TextHighlighterPopover } from './TextHighlighterPopover';
import { HighlightColor, getStoredHighlightColor } from '../lib/highlightColors';

interface HighlightSelectionWrapperProps {
  children: React.ReactNode;
  contextId: string;
  onAddHighlight: (highlight: Omit<HighlightItem, 'id' | 'createdAt'>) => void;
  className?: string;
  defaultColor?: HighlightColor;
}

export const HighlightSelectionWrapper: React.FC<HighlightSelectionWrapperProps> = ({
  children,
  contextId,
  onAddHighlight,
  className = '',
  defaultColor,
}) => {
  const [selectedText, setSelectedText] = useState('');
  const [popoverPos, setPopoverPos] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const handleApplyHighlight = (color?: HighlightColor) => {
    if (!selectedText) return;
    const resolvedColor = color || defaultColor || getStoredHighlightColor();
    onAddHighlight({
      passageId: contextId,
      text: selectedText,
      color: resolvedColor,
    });
    setSelectedText('');
    setPopoverPos(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleAddNote = (noteContent: string, color?: HighlightColor) => {
    if (!selectedText) return;
    const resolvedColor = color || defaultColor || getStoredHighlightColor();
    if (noteContent !== null) {
      onAddHighlight({
        passageId: contextId,
        text: selectedText,
        color: resolvedColor,
        note: noteContent || 'Passage note',
      });
    }
    setSelectedText('');
    setPopoverPos(null);
    window.getSelection()?.removeAllRanges();
  };

  return (
    <div className={`relative ${className}`} onMouseUp={handleMouseUp} ref={containerRef}>
      {children}
      {popoverPos && (
        <TextHighlighterPopover
          x={popoverPos.x}
          y={popoverPos.y}
          defaultColor={defaultColor}
          onHighlight={(chosenColor) => handleApplyHighlight(chosenColor)}
          onAddNote={(chosenColor) => {
            const note = window.prompt('Enter your note for this text:');
            if (note !== null) handleAddNote(note, chosenColor);
          }}
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
