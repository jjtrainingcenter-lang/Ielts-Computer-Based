import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Pin,
  X,
  Maximize2,
  ChevronDown,
  ChevronUp,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move,
  GripHorizontal,
} from 'lucide-react';
import { isGoogleDriveUrl } from '../lib/mediaUrls';

export interface PinnedImageWindowProps {
  imageUrl: string;
  imageAlt?: string;
  caption?: string;
  title?: string;
  onClose: () => void;
  onFullscreen?: () => void;
}

export const PinnedImageWindow: React.FC<PinnedImageWindowProps> = ({
  imageUrl,
  imageAlt,
  caption,
  title,
  onClose,
  onFullscreen,
}) => {
  // Floating Window Coordinates and Size
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    const width = 450;
    const initialX = Math.max(20, (typeof window !== 'undefined' ? window.innerWidth : 1200) - width - 36);
    return { x: initialX, y: 90 };
  });

  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 450,
    height: 400,
  });

  const [isMinimized, setIsMinimized] = useState(false);

  // Zoom and Pan inside pinned window
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ startX: number; startY: number; initPanX: number; initPanY: number }>({
    startX: 0,
    startY: 0,
    initPanX: 0,
    initPanY: 0,
  });

  // Dragging the whole window
  const [isDraggingWindow, setIsDraggingWindow] = useState(false);
  const dragWindowStartRef = useRef<{ startX: number; startY: number; initX: number; initY: number }>({
    startX: 0,
    startY: 0,
    initX: 0,
    initY: 0,
  });

  // Resizing the window via bottom-right corner
  const [isResizingWindow, setIsResizingWindow] = useState(false);
  const resizeStartRef = useRef<{ startX: number; startY: number; initW: number; initH: number }>({
    startX: 0,
    startY: 0,
    initW: 0,
    initH: 0,
  });

  // Window drag listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingWindow) {
        const dx = e.clientX - dragWindowStartRef.current.startX;
        const dy = e.clientY - dragWindowStartRef.current.startY;
        const newX = Math.max(10, Math.min(window.innerWidth - (isMinimized ? 280 : size.width) - 10, dragWindowStartRef.current.initX + dx));
        const newY = Math.max(10, Math.min(window.innerHeight - 60, dragWindowStartRef.current.initY + dy));
        setPosition({ x: newX, y: newY });
      } else if (isResizingWindow) {
        const dx = e.clientX - resizeStartRef.current.startX;
        const dy = e.clientY - resizeStartRef.current.startY;
        const newW = Math.max(280, Math.min(window.innerWidth - position.x - 10, resizeStartRef.current.initW + dx));
        const newH = Math.max(200, Math.min(window.innerHeight - position.y - 10, resizeStartRef.current.initH + dy));
        setSize({ width: newW, height: newH });
      }
    };

    const handleMouseUp = () => {
      if (isDraggingWindow) setIsDraggingWindow(false);
      if (isResizingWindow) setIsResizingWindow(false);
    };

    if (isDraggingWindow || isResizingWindow) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingWindow, isResizingWindow, isMinimized, size.width, position.x, position.y]);

  // Start dragging window
  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    // Only drag if left click and not clicking an interactive button
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDraggingWindow(true);
    dragWindowStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: position.x,
      initY: position.y,
    };
  };

  // Start resizing window
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizingWindow(true);
    resizeStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initW: size.width,
      initH: size.height,
    };
  };

  // Pan inside image
  const handleImageMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    panStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initPanX: pan.x,
      initPanY: pan.y,
    };
  };

  const handleImageMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    const dx = e.clientX - panStartRef.current.startX;
    const dy = e.clientY - panStartRef.current.startY;
    setPan({
      x: panStartRef.current.initPanX + dx,
      y: panStartRef.current.initPanY + dy,
    });
  };

  const handleImageMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    if (e.deltaY < 0) {
      setZoomLevel((prev) => Math.min(3.5, Math.round((prev + 0.2) * 100) / 100));
    } else {
      setZoomLevel((prev) => {
        const next = Math.max(0.6, Math.round((prev - 0.2) * 100) / 100);
        if (next <= 1) setPan({ x: 0, y: 0 });
        return next;
      });
    }
  };

  const setPresetSize = (w: number, h: number) => {
    setSize({
      width: Math.min(w, window.innerWidth - position.x - 10),
      height: Math.min(h, window.innerHeight - position.y - 10),
    });
  };

  return createPortal(
    <div
      className={`fixed z-[100] bg-white rounded-xl shadow-2xl border-2 border-[#00529b] flex flex-col overflow-hidden select-none transition-shadow ${
        isDraggingWindow ? 'shadow-[0_20px_50px_rgba(0,82,155,0.35)] opacity-95' : ''
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: isMinimized ? '300px' : `${size.width}px`,
        height: isMinimized ? 'auto' : `${size.height}px`,
      }}
    >
      {/* Draggable Window Header */}
      <div
        onMouseDown={handleHeaderMouseDown}
        className="flex items-center justify-between bg-gradient-to-r from-[#00529b] to-[#1a66aa] text-white px-3 py-2 cursor-move select-none shadow-xs"
        title="Click and drag to move picture anywhere"
      >
        <div className="flex items-center space-x-1.5 truncate max-w-[200px] sm:max-w-[260px]">
          <Pin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          <span className="text-xs font-bold truncate">
            {title || imageAlt || 'Pinned Reference Picture'}
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center space-x-1 shrink-0">
          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/20 rounded transition-colors text-white/90 hover:text-white"
            title={isMinimized ? 'Expand Pinned Picture' : 'Minimize to compact pill'}
          >
            {isMinimized ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {onFullscreen && !isMinimized && (
            <button
              type="button"
              onClick={onFullscreen}
              className="p-1 hover:bg-white/20 rounded transition-colors text-white/90 hover:text-white"
              title="Fullscreen Lightbox"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-rose-500 rounded transition-colors text-white/90 hover:text-white"
            title="Unpin & Dock back in page"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Body (when not minimized) */}
      {!isMinimized && (
        <>
          {/* Subheader Toolbar: Zoom & Size Presets */}
          <div className="px-3 py-1.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-slate-700 text-xs shrink-0">
            {/* Zoom Controls */}
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() =>
                  setZoomLevel((prev) => {
                    const next = Math.max(0.6, Math.round((prev - 0.25) * 100) / 100);
                    if (next <= 1) setPan({ x: 0, y: 0 });
                    return next;
                  })
                }
                disabled={zoomLevel <= 0.6}
                className="p-1 hover:bg-slate-200 rounded disabled:opacity-30"
                title="Zoom Out"
              >
                <ZoomOut className="w-3 h-3" />
              </button>

              <span className="font-mono text-[11px] font-semibold min-w-[38px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>

              <button
                type="button"
                onClick={() =>
                  setZoomLevel((prev) => Math.min(3.5, Math.round((prev + 0.25) * 100) / 100))
                }
                disabled={zoomLevel >= 3.5}
                className="p-1 hover:bg-slate-200 rounded disabled:opacity-30"
                title="Zoom In"
              >
                <ZoomIn className="w-3 h-3" />
              </button>

              {zoomLevel !== 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setZoomLevel(1);
                    setPan({ x: 0, y: 0 });
                  }}
                  className="p-1 hover:bg-slate-200 rounded text-amber-700 ml-0.5"
                  title="Reset Zoom (100%)"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Quick Resize Presets */}
            <div className="flex items-center space-x-1 text-[10px] text-slate-500">
              <span className="hidden sm:inline font-medium mr-0.5">Size:</span>
              <button
                type="button"
                onClick={() => setPresetSize(340, 300)}
                className={`px-1.5 py-0.5 rounded border ${
                  size.width <= 360
                    ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
                title="Compact size (340px)"
              >
                S
              </button>
              <button
                type="button"
                onClick={() => setPresetSize(460, 400)}
                className={`px-1.5 py-0.5 rounded border ${
                  size.width > 360 && size.width <= 520
                    ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
                title="Medium size (460px)"
              >
                M
              </button>
              <button
                type="button"
                onClick={() => setPresetSize(620, 500)}
                className={`px-1.5 py-0.5 rounded border ${
                  size.width > 520
                    ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
                title="Large size (620px)"
              >
                L
              </button>
            </div>
          </div>

          {/* Interactive Image Canvas */}
          <div
            className="flex-1 bg-slate-50 overflow-hidden relative flex items-center justify-center p-2"
            onWheel={handleWheel}
            onMouseDown={handleImageMouseDown}
            onMouseMove={handleImageMouseMove}
            onMouseUp={handleImageMouseUp}
            style={{
              cursor: isPanning ? 'grabbing' : zoomLevel > 1 ? 'grab' : 'default',
            }}
            onDoubleClick={() => {
              if (zoomLevel > 1) {
                setZoomLevel(1);
                setPan({ x: 0, y: 0 });
              } else {
                setZoomLevel(1.75);
              }
            }}
          >
            <div
              className="transition-transform duration-75 ease-out max-w-full max-h-full flex items-center justify-center"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`,
                transformOrigin: 'center center',
              }}
            >
              <img
                src={imageUrl}
                alt={imageAlt || 'Pinned Reference'}
                className="max-h-full max-w-full object-contain rounded shadow-xs pointer-events-none select-none"
                referrerPolicy={isGoogleDriveUrl(imageUrl) ? 'no-referrer' : undefined}
              />
            </div>
          </div>

          {/* Optional Caption */}
          {caption && (
            <div className="px-3 py-1 bg-white border-t border-slate-100 text-[11px] text-slate-500 italic text-center truncate">
              {caption}
            </div>
          )}

          {/* Footer Bar with Hint and Draggable Corner Handle */}
          <div className="bg-slate-100 px-3 py-1 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 shrink-0">
            <span className="flex items-center space-x-1">
              <Move className="w-3 h-3 text-slate-400" />
              <span>Drag header to move • Drag corner to resize</span>
            </span>

            {/* Bottom-Right Corner Resize Handle */}
            <div
              onMouseDown={handleResizeMouseDown}
              className="cursor-nwse-resize p-1 -mr-1.5 -mb-1 text-slate-400 hover:text-blue-600 transition-colors"
              title="Drag corner to resize width and height"
            >
              <GripHorizontal className="w-3.5 h-3.5 rotate-45" />
            </div>
          </div>
        </>
      )}
    </div>,
    document.body
  );
};
