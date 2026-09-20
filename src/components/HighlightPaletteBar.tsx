import React, { useEffect, useState } from 'react';
import { Highlighter } from 'lucide-react';
import { HIGHLIGHT_COLORS, HighlightColor, getStoredHighlightColor, setStoredHighlightColor } from '../lib/highlightColors';

interface HighlightPaletteBarProps {
  activeColor?: HighlightColor;
  onChangeColor?: (color: HighlightColor) => void;
  highlightCount?: number;
  compact?: boolean;
}

export const HighlightPaletteBar: React.FC<HighlightPaletteBarProps> = ({
  activeColor: controlledColor,
  onChangeColor,
  highlightCount,
  compact = false,
}) => {
  const [internalColor, setInternalColor] = useState<HighlightColor>(getStoredHighlightColor);

  const activeColor = controlledColor || internalColor;

  useEffect(() => {
    if (controlledColor) {
      setInternalColor(controlledColor);
    }
  }, [controlledColor]);

  const handleSelect = (color: HighlightColor) => {
    setInternalColor(color);
    setStoredHighlightColor(color);
    if (onChangeColor) {
      onChangeColor(color);
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-1 bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs select-none backdrop-blur-xs ${
        compact ? 'text-[11px]' : 'text-xs'
      }`}
    >
      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium mr-0.5">
        <Highlighter className="w-3.5 h-3.5 text-slate-500" />
        <span className="hidden sm:inline">Highlight:</span>
      </div>

      <div className="flex items-center space-x-1">
        {HIGHLIGHT_COLORS.map((col) => {
          const isSelected = activeColor === col.id;
          return (
            <button
              key={col.id}
              type="button"
              onClick={() => handleSelect(col.id)}
              title={`${col.label} Highlighter (Click to select)`}
              className={`w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full transition-all flex items-center justify-center ${
                col.dotBg
              } ${
                isSelected
                  ? `scale-115 shadow-xs ring-2 ${col.dotRing} ring-offset-1 ring-offset-white dark:ring-offset-slate-800`
                  : 'hover:scale-105 opacity-80 hover:opacity-100'
              }`}
            >
              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-slate-900/70" />}
            </button>
          );
        })}
      </div>

      {typeof highlightCount === 'number' && highlightCount > 0 && (
        <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded font-semibold">
          {highlightCount}
        </span>
      )}
    </div>
  );
};
