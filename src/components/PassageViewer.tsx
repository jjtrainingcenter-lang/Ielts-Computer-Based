import React, { useState, useRef } from 'react';
import { ReadingPassage, HighlightItem, DisplaySettings } from '../types';
import { TextHighlighterPopover } from './TextHighlighterPopover';
import { Highlighter, MessageSquare, StickyNote, Trash2, Plus } from 'lucide-react';

interface PassageViewerProps {
  passages: ReadingPassage[];
  activePassageId: string;
  onSelectPassage: (id: string) => void;
  highlights: HighlightItem[];
  onAddHighlight: (highlight: Omit<HighlightItem, 'id' | 'createdAt'>) => void;
  onRemoveHighlight: (id: string) => void;
  settings: DisplaySettings;
}

export const PassageViewer: React.FC<PassageViewerProps> = ({
  passages,
  activePassageId,
  onSelectPassage,
  highlights,
  onAddHighlight,
  onRemoveHighlight,
  settings,
}) => {
  const currentPassage = passages.find((p) => p.id === activePassageId) || passages[0];
  const [selectedText, setSelectedText] = useState('');
  const [popoverPos, setPopoverPos] = useState<{ x: number; y: number } | null>(null);
  const [showNotesDrawer, setShowNotesDrawer] = useState(false);
  const [newNoteInput, setNewNoteInput] = useState('');
  const passageRef = useRef<HTMLDivElement>(null);

  // Text selection handler
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
      setPopoverPos({
        x: rect.left + rect.width / 2,
        y: rect.top,
      });
    }
  };

  const handleApplyHighlight = (color: 'yellow' | 'cyan' | 'pink') => {
    if (!selectedText) return;
    onAddHighlight({
      passageId: currentPassage.id,
      text: selectedText,
      color,
    });
    setSelectedText('');
    setPopoverPos(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleAddNote = () => {
    if (!selectedText) return;
    onAddHighlight({
      passageId: currentPassage.id,
      text: selectedText,
      color: 'yellow',
      note: newNoteInput || 'Passage note',
    });
    setSelectedText('');
    setPopoverPos(null);
    setNewNoteInput('');
    setShowNotesDrawer(true);
    window.getSelection()?.removeAllRanges();
  };

  // Font size scale class
  const fontClass =
    settings.fontSize === 'large'
      ? 'text-lg leading-relaxed'
      : settings.fontSize === 'large'
      ? 'text-xl leading-relaxed'
      : 'text-base leading-normal';

  const passageHighlights = highlights.filter((h) => h.passageId === currentPassage.id);

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-300 relative">
      {/* Passage Selector Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-2">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mr-2">
            Passages:
          </h2>
          {passages.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectPassage(p.id)}
              className={`px-3 py-1 text-xs font-bold rounded transition-all ${
                p.id === currentPassage.id
                  ? 'bg-[#214162] text-white shadow-xs'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Passage {p.partNumber}
            </button>
          ))}
        </div>

        {/* Notes drawer trigger */}
        <button
          type="button"
          onClick={() => setShowNotesDrawer(!showNotesDrawer)}
          className={`text-[#214162] text-xs font-bold flex items-center space-x-1 px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50 ${
            showNotesDrawer ? 'bg-blue-50 border-blue-400' : ''
          }`}
        >
          <StickyNote className="w-3.5 h-3.5 text-blue-600" />
          <span>Notes ({passageHighlights.length})</span>
        </button>
      </div>

      {/* Main Passage Text Body */}
      <div
        ref={passageRef}
        onMouseUp={handleMouseUp}
        className={`flex-1 overflow-y-auto p-8 space-y-6 ${fontClass} text-gray-700 leading-relaxed selection:bg-blue-100 selection:text-gray-900`}
      >
        <div className="border-b border-gray-200 pb-4">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 block mb-1">
            Reading Passage {currentPassage.partNumber}
          </span>
          <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">
            {currentPassage.title}
          </h3>
          {currentPassage.subtitle && (
            <p className="text-sm italic text-gray-500">
              {currentPassage.subtitle}
            </p>
          )}
        </div>

        {/* Paragraphs */}
        <div className="space-y-4">
          {currentPassage.paragraphs.map((p) => (
            <div key={p.id} className="flex gap-4 group">
              <span className="shrink-0 w-6 h-6 rounded bg-gray-100 text-[#214162] font-extrabold text-xs flex items-center justify-center border border-gray-200 select-none">
                {p.id}
              </span>
              <p className="flex-1 text-gray-700 text-sm leading-relaxed text-justify">
                {p.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Text Highlighter Popover */}
      {popoverPos && (
        <TextHighlighterPopover
          x={popoverPos.x}
          y={popoverPos.y}
          selectedText={selectedText}
          onHighlight={handleApplyHighlight}
          onAddNote={handleAddNote}
          onClose={() => setPopoverPos(null)}
        />
      )}

      {/* Notes Drawer */}
      {showNotesDrawer && (
        <div className="absolute top-12 right-0 bottom-0 w-80 bg-amber-50/95 dark:bg-slate-900/95 border-l border-amber-200 dark:border-slate-800 shadow-2xl z-30 flex flex-col p-4 backdrop-blur-xs">
          <div className="flex items-center justify-between pb-3 border-b border-amber-200 dark:border-slate-800">
            <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 text-sm">
              <StickyNote className="w-4 h-4 text-amber-600" /> Passage Highlights & Notes
            </h4>
            <button
              onClick={() => setShowNotesDrawer(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-3 space-y-3">
            {passageHighlights.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-8">
                Select text in the passage to add highlights or personal notes.
              </p>
            ) : (
              passageHighlights.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-amber-200/80 dark:border-slate-700 shadow-xs space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        item.color === 'yellow'
                          ? 'bg-amber-200 text-amber-900'
                          : item.color === 'cyan'
                          ? 'bg-cyan-200 text-cyan-900'
                          : 'bg-pink-200 text-pink-900'
                      }`}
                    >
                      {item.color}
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemoveHighlight(item.id)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="italic text-slate-700 dark:text-slate-300 font-medium">
                    "{item.text}"
                  </p>
                  {item.note && (
                    <p className="text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700/60 pt-1.5 text-[11px]">
                      📝 {item.note}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
