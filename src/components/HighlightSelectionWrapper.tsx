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

  interface SelectionDetails {
    text: string;
    startOffset?: number;
    endOffset?: number;
    prefix?: string;
    suffix?: string;
  }
  const [selectionDetails, setSelectionDetails] = useState<SelectionDetails | null>(null);

  const captureSelectionDetails = (): SelectionDetails | null => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return null;
    const text = selection.toString().trim();
    if (!text) return null;

    try {
      const range = selection.getRangeAt(0);
      const root = containerRef.current;
      if (root) {
        let charOffset = 0;
        let found = false;
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
          const textNode = walker.currentNode;
          if (textNode === range.startContainer) {
            charOffset += range.startOffset;
            found = true;
            break;
          }
          charOffset += textNode.textContent?.length || 0;
        }

        const fullText = root.textContent || '';
        const prefix = fullText.slice(Math.max(0, charOffset - 30), charOffset);
        const suffix = fullText.slice(
          charOffset + text.length,
          Math.min(fullText.length, charOffset + text.length + 30)
        );

        return {
          text,
          startOffset: found ? charOffset : undefined,
          endOffset: found ? charOffset + text.length : undefined,
          prefix,
          suffix,
        };
      }
      return { text };
    } catch {
      return { text };
    }
  };

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setSelectedText('');
      setSelectionDetails(null);
      setPopoverPos(null);
      return;
    }

    const text = selection.toString().trim();
    if (text.length > 0) {
      try {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (rect.width > 0 || rect.height > 0) {
          const details = captureSelectionDetails();
          setSelectedText(text);
          setSelectionDetails(details);
          setPopoverPos({ x: rect.left + rect.width / 2, y: rect.top - 8 });
        }
      } catch (e) {}
    } else {
      setSelectedText('');
      setSelectionDetails(null);
      setPopoverPos(null);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      const text = selection.toString().trim();
      if (text.length > 0) {
        e.preventDefault();
        const details = captureSelectionDetails();
        setSelectedText(text);
        setSelectionDetails(details);
        setPopoverPos({ x: e.clientX, y: e.clientY - 10 });
      }
    }
  };

  const handleApplyHighlight = (color?: HighlightColor) => {
    const targetText = selectedText.trim();
    if (!targetText) return;
    const resolvedColor = color || defaultColor || getStoredHighlightColor();

    onAddHighlight({
      passageId: contextId,
      text: targetText,
      startOffset: selectionDetails?.startOffset,
      endOffset: selectionDetails?.endOffset,
      prefix: selectionDetails?.prefix,
      suffix: selectionDetails?.suffix,
      color: resolvedColor,
    });

    setSelectedText('');
    setSelectionDetails(null);
    setPopoverPos(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleAddNote = (noteContent: string, color?: HighlightColor) => {
    const targetText = selectedText.trim();
    if (!targetText) return;
    const resolvedColor = color || defaultColor || getStoredHighlightColor();

    onAddHighlight({
      passageId: contextId,
      text: targetText,
      startOffset: selectionDetails?.startOffset,
      endOffset: selectionDetails?.endOffset,
      prefix: selectionDetails?.prefix,
      suffix: selectionDetails?.suffix,
      color: resolvedColor,
      note: noteContent || 'Question note',
    });

    setSelectedText('');
    setSelectionDetails(null);
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
