import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
  Pin,
  PinOff,
  Maximize2,
  Minimize2,
  Move,
  ImageIcon,
} from 'lucide-react';

interface ImageLightboxModalProps {
  isOpen: boolean;
  imageUrl: string;
  imageAlt?: string;
  caption?: string;
  title?: string;
  onClose: () => void;
  onTogglePin?: () => void;
  isPinned?: boolean;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  imageUrl,
  imageAlt,
  caption,
  title,
  onClose,
  onTogglePin,
  isPinned = false,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initPanX: number; initPanY: number }>({
    startX: 0,
    startY: 0,
    initPanX: 0,
    initPanY: 0,
  });

  // Reset zoom & pan when modal opens or image changes
  useEffect(() => {
    if (isOpen) {
      setZoomLevel(1);
      setPan({ x: 0, y: 0 });
    }
  }, [isOpen, imageUrl]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setZoomLevel((prev) => Math.min(4, Math.round((prev + 0.25) * 100) / 100));
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        setZoomLevel((prev) => Math.max(0.5, Math.round((prev - 0.25) * 100) / 100));
      } else if (e.key === '0') {
        e.preventDefault();
        setZoomLevel(1);
        setPan({ x: 0, y: 0 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(4, Math.round((prev + 0.25) * 100) / 100));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const next = Math.max(0.5, Math.round((prev - 0.25) * 100) / 100);
      if (next <= 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoomLevel((prev) => Math.min(4, Math.round((prev + 0.2) * 100) / 100));
    } else {
      setZoomLevel((prev) => {
        const next = Math.max(0.5, Math.round((prev - 0.2) * 100) / 100);
        if (next <= 1) setPan({ x: 0, y: 0 });
        return next;
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initPanX: pan.x,
      initPanY: pan.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;
    setPan({
      x: dragStartRef.current.initPanX + dx,
      y: dragStartRef.current.initPanY + dy,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = () => {
    if (zoomLevel > 1) {
      setZoomLevel(1);
      setPan({ x: 0, y: 0 });
    } else {
      setZoomLevel(2);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[120] bg-black/92 backdrop-blur-md flex flex-col select-none animate-in fade-in duration-150"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800 text-white shrink-0 z-10 shadow-lg">
        {/* Title & Info */}
        <div className="flex items-center space-x-2 truncate max-w-md">
          <ImageIcon className="w-4 h-4 text-sky-400 shrink-0" />
          <span className="font-semibold text-sm truncate text-slate-100">
            {title || imageAlt || 'Examination Reference Image'}
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline">• Fullscreen Mode</span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-1.5 bg-slate-800/90 border border-slate-700/80 rounded-lg px-2 py-1 shadow-inner">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 0.5}
            className="p-1.5 hover:bg-slate-700 rounded transition-colors text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <span className="font-mono text-xs font-semibold px-2 min-w-[52px] text-center text-slate-200">
            {Math.round(zoomLevel * 100)}%
          </span>

          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 4}
            className="p-1.5 hover:bg-slate-700 rounded transition-colors text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-700 mx-1" />

          <button
            type="button"
            onClick={handleResetZoom}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              zoomLevel !== 1
                ? 'bg-amber-400/20 text-amber-300 hover:bg-amber-400/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
            }`}
            title="Reset to 100% (0)"
          >
            Reset
          </button>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center space-x-2">
          {onTogglePin && (
            <button
              type="button"
              onClick={onTogglePin}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isPinned
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
              title={isPinned ? 'Unpin Picture' : 'Pin Picture as floating card'}
            >
              {isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isPinned ? 'Pinned' : 'Pin Picture'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-rose-500/20 hover:text-rose-400 rounded-lg text-slate-300 transition-colors"
            title="Exit Fullscreen (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div
        className="flex-1 relative overflow-hidden flex items-center justify-center cursor-default bg-slate-950/80"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        style={{
          cursor: isDragging ? 'grabbing' : zoomLevel > 1 ? 'grab' : 'default',
        }}
        onDoubleClick={handleDoubleClick}
      >
        <div
          className="transition-transform duration-75 ease-out inline-flex items-center justify-center p-4 max-w-none max-h-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`,
            transformOrigin: 'center center',
          }}
        >
          <img
            src={imageUrl}
            alt={imageAlt || 'Examination Media'}
            className="max-h-[86vh] max-w-[92vw] w-auto h-auto object-contain rounded-lg shadow-2xl pointer-events-none select-none"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Help Overlay Hint */}
        <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-xs text-slate-300 text-[11px] px-3 py-1.5 rounded-full border border-slate-800 shadow-md flex items-center space-x-2 pointer-events-none opacity-75">
          <span>Scroll to zoom</span>
          <span>•</span>
          <span>Drag to pan</span>
          <span>•</span>
          <span>Double-click to toggle</span>
          <span>•</span>
          <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] text-slate-200 font-mono">Esc</kbd>
          <span>to exit</span>
        </div>
      </div>

      {/* Optional Caption at bottom */}
      {caption && (
        <div className="px-4 py-2 bg-slate-900/90 border-t border-slate-800 text-slate-300 text-xs text-center select-text">
          {caption}
        </div>
      )}
    </div>,
    document.body
  );
};
