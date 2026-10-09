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

  interface SelectionDetails {
    text: string;
    paragraphId?: string;
    paragraphIndex?: number;
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
      let el: Node | null = range.startContainer;
      let paraEl: HTMLElement | null = null;
      while (el && el !== passageRef.current && el !== document.body) {
        if (el instanceof HTMLElement && el.hasAttribute('data-paragraph-id')) {
          paraEl = el;
          break;
        }
        el = el.parentNode;
      }

      if (paraEl) {
        const pId = paraEl.getAttribute('data-paragraph-id') || undefined;
        const pIdxAttr = paraEl.getAttribute('data-paragraph-index');
        const pIdx = pIdxAttr !== null && pIdxAttr !== undefined ? parseInt(pIdxAttr, 10) : undefined;

        let charOffset = 0;
        let found = false;
        const walker = document.createTreeWalker(paraEl, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
          const textNode = walker.currentNode;
          if (textNode === range.startContainer) {
            charOffset += range.startOffset;
            found = true;
            break;
          }
          charOffset += textNode.textContent?.length || 0;
        }

        const fullParaText = paraEl.textContent || '';
        const prefix = fullParaText.slice(Math.max(0, charOffset - 30), charOffset);
        const suffix = fullParaText.slice(
          charOffset + text.length,
          Math.min(fullParaText.length, charOffset + text.length + 30)
        );

        return {
          text,
          paragraphId: pId,
          paragraphIndex: Number.isNaN(pIdx) ? undefined : pIdx,
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
    setTimeout(() => {
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
    }, 20);
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

  const handleApplyHighlight = (color?: HighlightColor, textToHighlight?: string) => {
    const targetText = (textToHighlight || selectedText || '').trim();
    if (!targetText) return;
    const resolvedColor = color || activeHighlightColor;

    onAddHighlight({
      passageId: currentPassage.id,
      text: targetText,
      paragraphId: selectionDetails?.paragraphId,
      paragraphIndex: selectionDetails?.paragraphIndex,
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
    const targetText = (selectedText || '').trim();
    if (!targetText) return;
    const resolvedColor = color || activeHighlightColor;

    onAddHighlight({
      passageId: currentPassage.id,
      text: targetText,
      paragraphId: selectionDetails?.paragraphId,
      paragraphIndex: selectionDetails?.paragraphIndex,
      startOffset: selectionDetails?.startOffset,
      endOffset: selectionDetails?.endOffset,
      prefix: selectionDetails?.prefix,
      suffix: selectionDetails?.suffix,
      color: resolvedColor,
      note: noteContent || 'Passage note',
    });

    setSelectedText('');
    setSelectionDetails(null);
    setPopoverPos(null);
    window.getSelection()?.removeAllRanges();
  };

  const handlePaletteColorChange = (col: HighlightColor) => {
    setActiveHighlightColor(col);
    setStoredHighlightColor(col);
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
    .filter((h) => h && h.text && h.passageId === currentPassage?.id)
    .sort((a, b) => b.text.trim().length - a.text.trim().length);

  const activeHighlight = activeHighlightId
    ? passageHighlights.find((h) => h.id === activeHighlightId)
    : null;

  const renderHighlightedText = (
    text: string,
    paragraphId?: string,
    paragraphIndex?: number
  ) => {
    if (!text) return null;
    const paraHighlights = passageHighlights.filter((h) => {
      if (h.paragraphId) {
        return h.paragraphId === paragraphId;
      }
      if (h.paragraphIndex !== undefined) {
        return h.paragraphIndex === paragraphIndex;
      }
      // If highlight didn't capture a paragraph context, only allow matching if this element also lacks paragraph context
      return !paragraphId && paragraphIndex === undefined;
    });

    if (paraHighlights.length === 0) return text;

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

    for (const h of paraHighlights) {
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

      // 3. Fallback: match the first unclaimed occurrence of targetText in this paragraph
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

      // Claim ONLY ONE occurrence per highlight item
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

    if (intervals.length === 0) return text;

    intervals.sort((a, b) => a.start - b.start);

    const chunks: { text: string; isHighlight: boolean; id?: string; color?: string; note?: string }[] = [];
    let cursor = 0;
    for (const item of intervals) {
      if (item.start > cursor) {
        chunks.push({ text: text.slice(cursor, item.start), isHighlight: false });
      }
      chunks.push({
        text: item.text,
        isHighlight: true,
        id: item.id,
        color: item.color,
        note: item.note,
      });
      cursor = item.end;
    }
    if (cursor < text.length) {
      chunks.push({ text: text.slice(cursor), isHighlight: false });
    }

    return (
      <>
        {chunks.map((part, i) => {
          if (part.isHighlight && part.id) {
            const markClass = getHighlightMarkClass(part.color);
            return (
              <mark
                key={`${part.id}-${i}`}
                className={`${markClass} cursor-pointer rounded-xs px-0.5 py-0.2 relative group select-text inline transition-colors`}
                onClick={(e) => {
                  e.stopPropagation();
                  const rect = e.currentTarget.getBoundingClientRect();
                  setActiveHighlightId(part.id!);
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
            <p
              data-paragraph-id="subtitle"
              className="text-xs text-slate-500 mt-0.5 select-text"
            >
              {renderHighlightedText(currentPassage.subtitle, 'subtitle')}
            </p>
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
        <h3
          data-paragraph-id="title"
          className="text-xl font-bold text-black mb-4 select-text"
        >
          {renderHighlightedText(currentPassage.title, 'title')}
        </h3>

        <div className="space-y-4 select-text">
          {currentPassage.paragraphs.map((p, idx) => {
            const paraId = p.id || `para-${idx}`;
            if (p.type === 'image' && p.imageUrl) {
              return (
                <div key={paraId} className="my-6 flex flex-col items-center justify-center">
                  <ExamImageViewer imageUrl={p.imageUrl} imageAlt={p.alt || p.caption} imageZoomable={true} />
                  {p.caption && <p className="text-sm text-slate-500 mt-2 font-medium">{p.caption}</p>}
                </div>
              );
            }
            if (p.type === 'heading') {
              return (
                <h4
                  key={paraId}
                  data-paragraph-id={paraId}
                  data-paragraph-index={idx}
                  className="text-lg font-bold text-black mt-6 mb-2"
                >
                  {renderHighlightedText(p.text || '', paraId, idx)}
                </h4>
              );
            }
            if (p.type === 'table') {
              return (
                <div key={paraId} className="my-4 overflow-x-auto border border-slate-300 rounded">
                  <pre
                    data-paragraph-id={paraId}
                    data-paragraph-index={idx}
                    className="p-4 text-sm font-mono whitespace-pre-wrap text-black bg-slate-50"
                  >
                    {renderHighlightedText(p.text || '', paraId, idx)}
                  </pre>
                </div>
              );
            }
            return (
              <p
                key={paraId}
                data-paragraph-id={paraId}
                data-paragraph-index={idx}
                className="text-black leading-relaxed text-left"
              >
                {renderHighlightedText(p.text || '', paraId, idx)}
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
