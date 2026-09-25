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

  const handleApplyHighlight = (color?: HighlightColor) => {
    if (!selectedText) return;
    const resolvedColor = color || defaultColor || getStoredHighlightColor();

    const segments = selectedText
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    segments.forEach((seg) => {
      onAddHighlight({
        passageId: contextId,
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
    const resolvedColor = color || defaultColor || getStoredHighlightColor();

    const segments = selectedText
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    segments.forEach((seg, idx) => {
      onAddHighlight({
        passageId: contextId,
        text: seg,
        color: resolvedColor,
        note: idx === 0 ? (noteContent || 'Question note') : undefined,
      });
    });

    setSelectedText('');
    setPopoverPos(null);
    window.getSelection()?.removeAllRanges();
  };

  return (
    <div
      className={`relative select-text ${className}`}
      onMouseUp={handleMouseUp}
      onContextMenu={handleContextMenu}
      ref={containerRef}
    >
      {children}
      {popoverPos && (
        <TextHighlighterPopover
          x={popoverPos.x}
          y={popoverPos.y}
          defaultColor={defaultColor}
          onHighlight={(chosenColor) => handleApplyHighlight(chosenColor)}
          onAddNote={(chosenColor, note) => handleAddNote(note || 'Question note', chosenColor)}
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
