import React from 'react';
import { Highlighter, MessageSquarePlus, Trash2 } from 'lucide-react';

interface TextHighlighterPopoverProps {
  x: number;
  y: number;
  selectedText: string;
  onHighlight: (color: 'yellow' | 'cyan' | 'pink') => void;
  onAddNote: () => void;
  onClose: () => void;
}

export const TextHighlighterPopover: React.FC<TextHighlighterPopoverProps> = ({
  x,
  y,
  selectedText,
  onHighlight,
  onAddNote,
  onClose,
}) => {
  if (!selectedText || selectedText.trim().length === 0) return null;

  return (
    <div
      style={{
        top: `${y - 45}px`,
        left: `${Math.max(10, x - 100)}px`,
      }}
      className="fixed z-50 flex items-center gap-1.5 bg-slate-900 text-white rounded-lg px-2.5 py-1.5 shadow-xl border border-slate-700 animate-in fade-in zoom-in-95 duration-150 select-none"
    >
      <span className="text-xs text-slate-300 font-medium mr-1 border-r border-slate-700 pr-2 max-w-[100px] truncate">
        "{selectedText}"
      </span>

      {/* Yellow highlight */}
      <button
        type="button"
        onClick={() => onHighlight('yellow')}
        className="w-5 h-5 rounded-full bg-amber-300 hover:scale-110 transition-transform ring-1 ring-black/20"
        title="Highlight Yellow"
      />

      {/* Cyan highlight */}
      <button
        type="button"
        onClick={() => onHighlight('cyan')}
        className="w-5 h-5 rounded-full bg-cyan-300 hover:scale-110 transition-transform ring-1 ring-black/20"
        title="Highlight Cyan"
      />

      {/* Pink highlight */}
      <button
        type="button"
        onClick={() => onHighlight('pink')}
        className="w-5 h-5 rounded-full bg-pink-300 hover:scale-110 transition-transform ring-1 ring-black/20"
        title="Highlight Pink"
      />

      <div className="h-4 w-[1px] bg-slate-700 mx-0.5" />

      {/* Add Note */}
      <button
        type="button"
        onClick={onAddNote}
        className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1 rounded transition-colors"
      >
        <MessageSquarePlus className="w-3.5 h-3.5 text-amber-400" />
        <span>Note</span>
      </button>

      {/* Close */}
      <button
        type="button"
        onClick={onClose}
        className="text-slate-400 hover:text-white ml-1 p-0.5 rounded hover:bg-slate-800"
      >
        ✕
      </button>
    </div>
  );
};
