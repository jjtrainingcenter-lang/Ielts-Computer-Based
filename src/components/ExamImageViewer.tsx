import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

interface ExamImageViewerProps {
  imageUrl: string;
  imageAlt?: string;
  imageZoomable?: boolean;
}

export const ExamImageViewer: React.FC<ExamImageViewerProps> = ({
  imageUrl,
  imageAlt,
  imageZoomable
}) => {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <div className="relative group bg-white border border-slate-200 rounded-lg p-2 flex justify-center">
      <img
        src={imageUrl}
        alt={imageAlt || "Examination Media"}
        className={`w-full max-w-2xl h-auto rounded transition-transform duration-300 ease-in-out ${
          isZoomed ? 'scale-150 origin-top' : 'scale-100'
        }`}
        style={{ cursor: imageZoomable ? (isZoomed ? 'zoom-out' : 'zoom-in') : 'default' }}
        onClick={() => {
          if (imageZoomable) {
            setIsZoomed(!isZoomed);
          }
        }}
        referrerPolicy="no-referrer"
      />
      {imageZoomable && (
        <div className="absolute top-4 right-4 bg-black/60 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
          <button
            type="button"
            className="p-1 hover:bg-black/80 rounded"
            onClick={() => setIsZoomed(!isZoomed)}
            title={isZoomed ? "Zoom Out" : "Zoom In"}
          >
            {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );
};
