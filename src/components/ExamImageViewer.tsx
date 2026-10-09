import React, { useEffect, useMemo, useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, AlertCircle } from 'lucide-react';
import { getGoogleDrivePreviewUrl, getMediaUrlCandidates } from '../lib/mediaUrls';

interface ExamImageViewerProps {
  imageUrl: string;
  imageAlt?: string;
  imageZoomable?: boolean;
}

export const ExamImageViewer: React.FC<ExamImageViewerProps> = ({
  imageUrl,
  imageAlt,
  imageZoomable = true,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [directImageFailed, setDirectImageFailed] = useState(false);

  const candidates = useMemo(() => getMediaUrlCandidates(imageUrl, 'image'), [imageUrl]);
  const previewUrl = useMemo(() => getGoogleDrivePreviewUrl(imageUrl), [imageUrl]);
  const resolvedImageUrl = candidates[candidateIndex] || imageUrl;

  useEffect(() => {
    setCandidateIndex(0);
    setDirectImageFailed(false);
    setZoomLevel(1);
  }, [imageUrl]);

  const handleImageError = () => {
    if (candidateIndex < candidates.length - 1) {
      setCandidateIndex((index) => index + 1);
      return;
    }
    setDirectImageFailed(true);
  };

  const zoomIn = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoomLevel((prev) => Math.min(2.5, Math.round((prev + 0.35) * 100) / 100));
  };

  const zoomOut = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoomLevel((prev) => Math.max(1, Math.round((prev - 0.35) * 100) / 100));
  };

  const resetZoom = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoomLevel(1);
  };

  if (!imageUrl) return null;

  // Google Drive's /preview endpoint is a dependable last-resort renderer when
  // the share link cannot be consumed as a direct <img> URL.
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
        <div className="text-xs">
          <p className="font-bold">Image could not be displayed.</p>
          <p className="mt-1">Use a public image URL or a Google Drive file shared as “Anyone with the link”.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group bg-white border border-slate-200 rounded-lg p-2 w-full flex flex-col items-center overflow-hidden">
      <div className="w-full overflow-auto flex justify-center max-h-[70vh] ielts-scroll">
        <img
          src={resolvedImageUrl}
          alt={imageAlt || 'Examination Media'}
          className="max-w-full h-auto rounded transition-transform duration-200 ease-out origin-center"
          style={{
            transform: `scale(${zoomLevel})`,
            cursor: imageZoomable ? (zoomLevel > 1 ? 'zoom-out' : 'zoom-in') : 'default',
          }}
          onClick={() => {
            if (imageZoomable) {
              setZoomLevel((prev) => (prev > 1 ? 1 : 1.5));
            }
          }}
          onError={handleImageError}
          referrerPolicy="no-referrer"
        />
      </div>

      {imageZoomable && (
        <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white rounded-lg px-2 py-1 flex items-center space-x-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
          <button
            type="button"
            className="p-1 hover:bg-white/20 rounded transition-colors disabled:opacity-40"
            onClick={zoomOut}
            disabled={zoomLevel <= 1}
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono font-medium px-1 select-none min-w-[34px] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            type="button"
            className="p-1 hover:bg-white/20 rounded transition-colors disabled:opacity-40"
            onClick={zoomIn}
            disabled={zoomLevel >= 2.5}
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          {zoomLevel > 1 && (
            <button
              type="button"
              className="p-1 hover:bg-white/20 rounded transition-colors text-amber-300"
              onClick={resetZoom}
              title="Reset Zoom (100%)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
