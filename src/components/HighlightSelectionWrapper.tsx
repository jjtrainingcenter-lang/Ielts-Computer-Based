import React, { useState, useRef } from 'react';
import { HighlightItem } from '../types';
import { TextHighlighterPopover } from './TextHighlighterPopover';

interface HighlightSelectionWrapperProps {
  children: React.ReactNode;
  contextId: string;
  onAddHighlight: (highlight: Omit<HighlightItem, 'id' | 'createdAt'>) => void;
  className?: string;
}

export const HighlightSelectionWrapper: React.FC<HighlightSelectionWrapperProps> = ({
  children,
  contextId,
  onAddHighlight,
  className = '',
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

  const handleApplyHighlight = () => {
    if (!selectedText) return;
    onAddHighlight({
      passageId: contextId,
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
        passageId: contextId,
        text: selectedText,
        color: 'yellow',
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
          onHighlight={handleApplyHighlight}
          onAddNote={() => {
            const note = window.prompt('Enter your note for this text:');
            if (note !== null) handleAddNote(note);
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
