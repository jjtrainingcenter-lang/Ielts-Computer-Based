import React, { useState } from 'react';
import { MessageSquareQuote, Highlighter, X } from 'lucide-react';
import { HIGHLIGHT_COLORS, HighlightColor, getStoredHighlightColor, setStoredHighlightColor } from '../lib/highlightColors';

interface TextHighlighterPopoverProps {
  x: number;
  y: number;
  onHighlight: (color?: HighlightColor) => void;
  onAddNote: (color?: HighlightColor, noteText?: string) => void;
  onClose: () => void;
  defaultColor?: HighlightColor;
}

export const TextHighlighterPopover: React.FC<TextHighlighterPopoverProps> = ({
  x,
  y,
  onHighlight,
  onAddNote,
  onClose,
  defaultColor,
}) => {
  const [selectedColor, setSelectedColor] = useState<HighlightColor>(() => defaultColor || getStoredHighlightColor());
  const [isEnteringNote, setIsEnteringNote] = useState(false);
  const [noteText, setNoteText] = useState('');

  const handleSelectColor = (color: HighlightColor) => {
    setSelectedColor(color);
    setStoredHighlightColor(color);
    onHighlight(color);
  };

  const handleSaveNote = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onAddNote(selectedColor, noteText.trim() || 'Highlighted note');
    setIsEnteringNote(false);
  };

  // Keep popover safely inside viewport bounds
  const clampedX = Math.max(140, Math.min(window.innerWidth - 140, x));
  const clampedY = Math.max(70, y);

  return (
    <div
      className="fixed z-50 transform -translate-x-1/2 -translate-y-full pb-3 animate-in fade-in zoom-in-95 duration-100"
      style={{ left: clampedX, top: clampedY }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-xl rounded-xl flex items-center p-1.5 space-x-1.5 relative select-none">
        {isEnteringNote ? (
          <form onSubmit={handleSaveNote} className="flex items-center space-x-1.5 px-1 py-0.5">
            <input
              autoFocus
              type="text"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Type note for highlight..."
              className="text-xs px-2.5 py-1 w-48 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#214162]"
            />
            <button
              type="submit"
              className="px-2.5 py-1 bg-[#214162] hover:bg-[#1a334e] text-white text-xs font-bold rounded-md transition-colors"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsEnteringNote(false)}
              className="px-2 py-1 text-slate-500 hover:text-slate-700 text-xs"
            >
              Cancel
            </button>
          </form>
        ) : (
          <>
            {/* Color Palette Swatches */}
            <div className="flex items-center space-x-1 px-1 py-0.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200/80 dark:border-slate-700/80">
              {HIGHLIGHT_COLORS.map((col) => {
                const isSelected = selectedColor === col.id;
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectColor(col.id);
                    }}
                    title={`Highlight in ${col.label}`}
                    className={`w-6 h-6 rounded-full transition-all flex items-center justify-center relative ${
                      col.dotBg
                    } ${
                      isSelected
                        ? `scale-110 shadow-xs ring-2 ${col.dotRing} ring-offset-1 ring-offset-white dark:ring-offset-slate-800`
                        : 'hover:scale-105 opacity-85 hover:opacity-100'
                    }`}
                  >
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-900/70" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="w-[1px] h-7 bg-slate-200 dark:bg-slate-700" />

            {/* Highlight Action Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onHighlight(selectedColor);
              }}
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-900 dark:bg-yellow-900/40 dark:text-yellow-200 rounded-lg transition-colors font-bold text-xs shadow-xs"
              title={`Highlight using selected ${selectedColor}`}
            >
              <Highlighter className="w-3.5 h-3.5 text-yellow-700 dark:text-yellow-300" />
              <span>Highlight</span>
            </button>

            <div className="w-[1px] h-7 bg-slate-200 dark:bg-slate-700" />

            {/* Note Action Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsEnteringNote(true);
              }}
              className="flex items-center space-x-1 px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 transition-colors font-medium text-xs"
              title="Add note to selected text"
            >
              <MessageSquareQuote className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
              <span>Note</span>
            </button>

            {/* Dismiss Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-400 hover:text-slate-600 transition-colors ml-0.5"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </>
        )}

        {/* Triangle arrow */}
        <div className="absolute left-1/2 bottom-1 transform -translate-x-1/2 translate-y-full pointer-events-none">
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-300 dark:border-t-slate-700 relative">
            <div className="absolute left-1/2 bottom-1 transform -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-white dark:border-t-slate-800" />
          </div>
        </div>
      </div>
    </div>
  );
};
