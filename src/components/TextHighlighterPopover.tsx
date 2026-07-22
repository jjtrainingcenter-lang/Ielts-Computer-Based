import React from 'react';
import { MessageSquareQuote, Highlighter } from 'lucide-react';

interface TextHighlighterPopoverProps {
  x: number;
  y: number;
  onHighlight: () => void;
  onAddNote: () => void;
  onClose: () => void;
}

export const TextHighlighterPopover: React.FC<TextHighlighterPopoverProps> = ({
  x,
  y,
  onHighlight,
  onAddNote,
  onClose,
}) => {
  return (
    <div
      className="fixed z-50 transform -translate-x-1/2 -translate-y-full pb-3"
      style={{ left: x, top: y }}
    >
      <div className="bg-white border border-gray-300 shadow-md rounded flex items-center p-1 space-x-1 relative">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAddNote();
          }}
          className="flex flex-col items-center justify-center w-12 h-10 hover:bg-gray-100 rounded text-gray-600 transition-colors"
        >
          <MessageSquareQuote className="w-4 h-4 mb-0.5 fill-gray-500" />
          <span className="text-[10px] font-medium">Note</span>
        </button>
        <div className="w-[1px] h-8 bg-gray-200" />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onHighlight();
          }}
          className="flex flex-col items-center justify-center w-12 h-10 hover:bg-gray-100 rounded text-gray-600 transition-colors"
        >
          <Highlighter className="w-4 h-4 mb-0.5 fill-gray-500" />
          <span className="text-[10px] font-medium">Highlight</span>
        </button>

        {/* Triangle arrow */}
        <div className="absolute left-1/2 bottom-1 transform -translate-x-1/2 translate-y-full">
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-300 relative">
            <div className="absolute left-1/2 bottom-1 transform -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-white" />
          </div>
        </div>
      </div>
    </div>
  );
};
