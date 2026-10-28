import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  AlertCircle,
  Pin,
  PinOff,
  Maximize2,
  GripHorizontal,
  Move,
  ArrowsUpFromLine,
  Expand,
} from 'lucide-react';
import { getGoogleDrivePreviewUrl, getMediaUrlCandidates, isGoogleDriveUrl } from '../lib/mediaUrls';
import { ImageLightboxModal } from './ImageLightboxModal';
import { PinnedImageWindow } from './PinnedImageWindow';

export interface ExamImageViewerProps {
  imageUrl: string;
  imageAlt?: string;
  imageCaption?: string;
  imageZoomable?: boolean;
  canPin?: boolean;
  canFullscreen?: boolean;
  canResize?: boolean;
  title?: string;
  defaultHeight?: number;
}

export const ExamImageViewer: React.FC<ExamImageViewerProps> = ({
  imageUrl,
  imageAlt,
  imageCaption,
  imageZoomable = true,
  canPin = true,
  canFullscreen = true,
  canResize = true,
  title,
  defaultHeight = 380,
}) => {
  // Zoom & Pan state
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ startX: number; startY: number; initPanX: number; initPanY: number }>({
    startX: 0,
    startY: 0,
    initPanX: 0,
    initPanY: 0,
  });

  // Inline container height resizing
  const [containerHeight, setContainerHeight] = useState<number>(defaultHeight);
  const [isResizingHeight, setIsResizingHeight] = useState(false);
  const resizeHeightStartRef = useRef<{ startY: number; initHeight: number }>({
    startY: 0,
    initHeight: defaultHeight,
  });

  // Pin & Fullscreen states
  const [isPinned, setIsPinned] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fallbacks & URLs
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [directImageFailed, setDirectImageFailed] = useState(false);

  const candidates = useMemo(() => getMediaUrlCandidates(imageUrl, 'image'), [imageUrl]);
  const previewUrl = useMemo(() => getGoogleDrivePreviewUrl(imageUrl), [imageUrl]);
  const resolvedImageUrl = candidates[candidateIndex] || imageUrl;

  useEffect(() => {
    setCandidateIndex(0);
    setDirectImageFailed(false);
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  }, [imageUrl]);

  // Handle inline height resize dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingHeight) return;
      const dy = e.clientY - resizeHeightStartRef.current.startY;
      const newHeight = Math.max(180, Math.min(800, resizeHeightStartRef.current.initHeight + dy));
      setContainerHeight(newHeight);
    };

    const handleMouseUp = () => {
      if (isResizingHeight) setIsResizingHeight(false);
    };

    if (isResizingHeight) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingHeight]);

  const handleStartResizeHeight = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizingHeight(true);
    resizeHeightStartRef.current = {
      startY: e.clientY,
      initHeight: containerHeight,
    };
  };

  const handleImageError = () => {
    if (candidateIndex < candidates.length - 1) {
      setCandidateIndex((index) => index + 1);
      return;
    }
    setDirectImageFailed(true);
  };

  const zoomIn = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoomLevel((prev) => Math.min(3.5, Math.round((prev + 0.25) * 100) / 100));
  };

  const zoomOut = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoomLevel((prev) => {
      const next = Math.max(0.6, Math.round((prev - 0.25) * 100) / 100);
      if (next <= 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const resetZoom = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!imageZoomable) return;
    // Allow zooming with wheel when cursor is over image
    if (e.ctrlKey || e.metaKey || zoomLevel > 1) {
      e.preventDefault();
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
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageZoomable || e.button !== 0) return;
    setIsPanning(true);
    panStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initPanX: pan.x,
      initPanY: pan.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    const dx = e.clientX - panStartRef.current.startX;
    const dy = e.clientY - panStartRef.current.startY;
    setPan({
      x: panStartRef.current.initPanX + dx,
      y: panStartRef.current.initPanY + dy,
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleDoubleClick = () => {
    if (!imageZoomable) return;
    if (zoomLevel > 1) {
      setZoomLevel(1);
      setPan({ x: 0, y: 0 });
    } else {
      setZoomLevel(1.75);
    }
  };

  if (!imageUrl) return null;

  // Google Drive iframe fallback
  if (directImageFailed && previewUrl) {
    return (
      <div className="relative bg-white border border-slate-200 rounded-lg p-2 w-full max-w-2xl">
        <iframe
          src={previewUrl}
          title={imageAlt || 'Examination Media'}
          className="w-full min-h-[420px] rounded border-0 bg-white"
          allow="autoplay"
        />
        <p className="mt-2 text-[11px] text-slate-500 text-center">
          Displayed from Google Drive. The Drive file must be shared as “Anyone with the link”.
        </p>
      </div>
    );
  }

  if (directImageFailed) {
    return (
      <div className="w-full max-w-2xl rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
        <div className="text-xs flex-1">
          <p className="font-bold">Image could not be displayed.</p>
          <p className="mt-1 text-slate-600">
            Use a public image URL or a Google Drive file shared as “Anyone with the link”.
          </p>
          <button
            type="button"
            onClick={() => {
              setDirectImageFailed(false);
              setCandidateIndex(0);
            }}
            className="mt-2.5 px-3 py-1 bg-white border border-red-300 rounded text-red-700 font-semibold hover:bg-red-100 transition-colors text-xs inline-flex items-center gap-1 shadow-2xs"
          >
            <RotateCcw className="w-3 h-3" /> Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Pinned Window (Floating Portal) */}
      {isPinned && (
        <PinnedImageWindow
          imageUrl={resolvedImageUrl}
          imageAlt={imageAlt}
          caption={imageCaption}
          title={title || imageAlt}
          onClose={() => setIsPinned(false)}
          onFullscreen={canFullscreen ? () => setIsFullscreen(true) : undefined}
        />
      )}

      {/* Fullscreen Lightbox Modal (Portal) */}
      {isFullscreen && (
        <ImageLightboxModal
          isOpen={isFullscreen}
          imageUrl={resolvedImageUrl}
          imageAlt={imageAlt}
          caption={imageCaption}
          title={title || imageAlt}
          onClose={() => setIsFullscreen(false)}
          onTogglePin={canPin ? () => setIsPinned(!isPinned) : undefined}
          isPinned={isPinned}
        />
      )}

      {/* Inline Viewer Container */}
      <div className="relative group bg-white border border-slate-200 rounded-xl w-full flex flex-col overflow-hidden shadow-xs hover:border-slate-300 transition-colors">
        {/* Top Floating Control Bar */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50/95 border-b border-slate-200/80 text-slate-700 text-xs select-none">
          {/* Left Label */}
          <span className="font-semibold text-slate-700 truncate max-w-[200px] flex items-center gap-1.5">
            {imageAlt || 'Visual Reference'}
          </span>

          {/* Right Action Buttons: Zoom, Pin, Fullscreen */}
          <div className="flex items-center space-x-1 shrink-0">
            {imageZoomable && (
              <div className="flex items-center bg-white border border-slate-200 rounded-lg shadow-2xs px-1.5 py-0.5 mr-1">
                <button
                  type="button"
                  className="p-1 hover:bg-slate-100 rounded transition-colors disabled:opacity-30 text-slate-600 hover:text-black"
                  onClick={zoomOut}
                  disabled={zoomLevel <= 0.6}
                  title="Zoom Out (-)"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono font-medium px-1.5 select-none min-w-[38px] text-center text-slate-800">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  className="p-1 hover:bg-slate-100 rounded transition-colors disabled:opacity-30 text-slate-600 hover:text-black"
                  onClick={zoomIn}
                  disabled={zoomLevel >= 3.5}
                  title="Zoom In (+)"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                {zoomLevel !== 1 && (
                  <button
                    type="button"
                    className="p-1 hover:bg-slate-100 rounded transition-colors text-amber-600 ml-0.5"
                    onClick={resetZoom}
                    title="Reset Zoom (100%)"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Pin Picture Toggle */}
            {canPin && (
              <button
                type="button"
                onClick={() => setIsPinned(!isPinned)}
                className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  isPinned
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 hover:text-black'
                }`}
                title={isPinned ? 'Picture is pinned to floating window' : 'Pin picture as a movable floating card'}
              >
                {isPinned ? <PinOff className="w-3.5 h-3.5 text-amber-700" /> : <Pin className="w-3.5 h-3.5 text-blue-600" />}
                <span className="hidden sm:inline">{isPinned ? 'Pinned' : 'Pin Picture'}</span>
              </button>
            )}

            {/* Fullscreen Modal Toggle */}
            {canFullscreen && (
              <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 hover:text-black rounded-lg border border-slate-200 transition-colors"
                title="Open high-resolution fullscreen lightbox"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* If Pinned Notification banner (optional gentle hint) */}
        {isPinned && (
          <div className="bg-amber-50/80 border-b border-amber-200/60 px-3 py-1.5 text-[11px] text-amber-900 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Pin className="w-3 h-3 text-amber-600 shrink-0" />
              <span>Picture is pinned to floating window above. You can drag and resize it anywhere.</span>
            </span>
            <button
              type="button"
              onClick={() => setIsPinned(false)}
              className="font-bold underline hover:text-amber-950 ml-2 text-[10px]"
            >
              Dock Back
            </button>
          </div>
        )}

        {/* Image Viewing Box */}
        <div
          className="w-full relative overflow-hidden flex items-center justify-center bg-slate-50 select-none transition-[height] duration-75"
          style={{
            height: `${containerHeight}px`,
            cursor: isPanning ? 'grabbing' : zoomLevel > 1 ? 'grab' : 'default',
          }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onDoubleClick={handleDoubleClick}
        >
          <div
            className="transition-transform duration-75 ease-out max-w-full max-h-full flex items-center justify-center"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`,
              transformOrigin: 'center center',
            }}
          >
            <img
              src={resolvedImageUrl}
              alt={imageAlt || 'Examination Media'}
              className="max-h-full max-w-full object-contain rounded transition-transform pointer-events-none select-none"
              onError={handleImageError}
              referrerPolicy={isGoogleDriveUrl(resolvedImageUrl) ? 'no-referrer' : undefined}
            />
          </div>

          {/* Quick instructions hint when hovering */}
          {zoomLevel > 1 && (
            <div className="absolute bottom-2 left-2 bg-slate-900/70 text-white text-[10px] px-2 py-1 rounded pointer-events-none opacity-80 backdrop-blur-xs">
              Drag to pan • Double-click to reset
            </div>
          )}
        </div>

        {/* Bottom Resize Bar & Preset Height Toggles */}
        {canResize && (
          <div
            onMouseDown={handleStartResizeHeight}
            className="w-full h-5 bg-slate-100 hover:bg-slate-200 border-t border-slate-200 flex items-center justify-center cursor-row-resize select-none transition-colors group/resize"
            title="Drag up or down to resize image height"
          >
            <div className="flex items-center space-x-1 text-slate-400 group-hover/resize:text-blue-600 transition-colors">
              <GripHorizontal className="w-4 h-4" />
              <span className="text-[9px] uppercase tracking-wider font-semibold hidden group-hover/resize:inline">
                Drag to resize height ({containerHeight}px)
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
