import React, { useState } from 'react';
import { Trash2, MessageSquareQuote, Check, X, Pencil } from 'lucide-react';
import { HIGHLIGHT_COLORS, HighlightColor } from '../lib/highlightColors';

interface HighlightActionPopoverProps {
  x: number;
  y: number;
  currentColor?: string;
  note?: string;
  onChangeColor: (color: HighlightColor) => void;
  onSaveNote: (note: string) => void;
  onRemove: () => void;
  onClose: () => void;
}

export const HighlightActionPopover: React.FC<HighlightActionPopoverProps> = ({
  x,
  y,
  currentColor = 'yellow',
  note = '',
  onChangeColor,
  onSaveNote,
  onRemove,
  onClose,
}) => {
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(note || '');

  const clampedX = Math.max(150, Math.min(window.innerWidth - 150, x));
  const clampedY = Math.max(70, y);

  const handleSaveNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveNote(noteText.trim());
    setIsEditingNote(false);
  };

  return (
    <div
      className="fixed z-50 transform -translate-x-1/2 -translate-y-full pb-3 animate-in fade-in zoom-in-95 duration-100"
      style={{ left: clampedX, top: clampedY }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-xl rounded-xl p-2 min-w-[240px] max-w-[320px] select-none text-slate-800 dark:text-slate-100">
        {/* Header / Color Palette */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Highlight Color
          </span>
          <div className="flex items-center space-x-1">
            {HIGHLIGHT_COLORS.map((col) => {
              const isSelected = currentColor.toLowerCase() === col.id.toLowerCase();
              return (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => onChangeColor(col.id)}
                  title={`Change to ${col.label}`}
                  className={`w-5 h-5 rounded-full transition-all flex items-center justify-center ${
                    col.dotBg
                  } ${
                    isSelected
                      ? `scale-110 shadow-xs ring-2 ${col.dotRing} ring-offset-1 ring-offset-white dark:ring-offset-slate-800`
                      : 'hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                >
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-slate-900/70" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Note section */}
        {isEditingNote ? (
          <form onSubmit={handleSaveNoteSubmit} className="pt-2 space-y-2">
            <textarea
              autoFocus
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Type your note..."
              rows={2}
              className="w-full text-xs p-1.5 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-[#214162]"
            />
            <div className="flex items-center justify-end space-x-1.5">
              <button
                type="button"
                onClick={() => setIsEditingNote(false)}
                className="px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center space-x-1 px-2.5 py-1 bg-[#214162] hover:bg-[#1a334e] text-white text-[11px] font-bold rounded"
              >
                <Check className="w-3 h-3" />
                <span>Save</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="pt-2">
            {note ? (
              <div className="p-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-md text-xs text-amber-950 dark:text-amber-200 mb-2 flex items-start justify-between gap-1.5">
                <span className="italic flex-1 break-words">{note}</span>
                <button
                  type="button"
                  onClick={() => setIsEditingNote(true)}
                  className="text-amber-700 hover:text-amber-900 dark:text-amber-300 shrink-0 p-0.5"
                  title="Edit note"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              </div>
            ) : null}

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setIsEditingNote(true)}
                className="inline-flex items-center space-x-1 text-xs text-slate-600 dark:text-slate-300 hover:text-[#214162] font-medium py-1 px-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <MessageSquareQuote className="w-3.5 h-3.5" />
                <span>{note ? 'Edit Note' : 'Add Note'}</span>
              </button>

              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={onRemove}
                  className="inline-flex items-center space-x-1 text-xs text-red-600 hover:text-red-700 font-medium py-1 px-2 rounded hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  title="Remove this highlight"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  title="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
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
