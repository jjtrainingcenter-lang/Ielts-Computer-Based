import React, { useEffect, useMemo, useState } from 'react';
import { ZoomIn, ZoomOut, AlertCircle } from 'lucide-react';
import { getGoogleDrivePreviewUrl, getMediaUrlCandidates } from '../lib/mediaUrls';

interface ExamImageViewerProps {
  imageUrl: string;
  imageAlt?: string;
  imageZoomable?: boolean;
}

export const ExamImageViewer: React.FC<ExamImageViewerProps> = ({
  imageUrl,
  imageAlt,
  imageZoomable,
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [directImageFailed, setDirectImageFailed] = useState(false);

  const candidates = useMemo(() => getMediaUrlCandidates(imageUrl, 'image'), [imageUrl]);
  const previewUrl = useMemo(() => getGoogleDrivePreviewUrl(imageUrl), [imageUrl]);
  const resolvedImageUrl = candidates[candidateIndex] || imageUrl;

  useEffect(() => {
    setCandidateIndex(0);
    setDirectImageFailed(false);
    setIsZoomed(false);
  }, [imageUrl]);

  const handleImageError = () => {
    if (candidateIndex < candidates.length - 1) {
      setCandidateIndex((index) => index + 1);
      return;
    }
    setDirectImageFailed(true);
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
    <div className="relative group bg-white border border-slate-200 rounded-lg p-2 flex justify-center overflow-visible">
      <img
        src={resolvedImageUrl}
        alt={imageAlt || 'Examination Media'}
        className={`w-full max-w-2xl h-auto rounded transition-transform duration-300 ease-in-out ${
          isZoomed ? 'scale-150 origin-top' : 'scale-100'
        }`}
        style={{ cursor: imageZoomable ? (isZoomed ? 'zoom-out' : 'zoom-in') : 'default' }}
        onClick={() => {
          if (imageZoomable) setIsZoomed(!isZoomed);
        }}
        onError={handleImageError}
        referrerPolicy="no-referrer"
      />
      {imageZoomable && (
        <div className="absolute top-4 right-4 bg-black/60 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
          <button
            type="button"
            className="p-1 hover:bg-black/80 rounded"
            onClick={() => setIsZoomed(!isZoomed)}
            title={isZoomed ? 'Zoom Out' : 'Zoom In'}
          >
            {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );
};
