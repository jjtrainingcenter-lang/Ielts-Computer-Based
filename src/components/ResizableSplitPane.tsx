import React, { useState, useRef, useEffect, ReactNode } from 'react';

interface ResizableSplitPaneProps {
  leftPane: ReactNode;
  rightPane: ReactNode;
  initialLeftWidthPercent?: number;
  minLeftWidthPercent?: number;
  maxLeftWidthPercent?: number;
}

export const ResizableSplitPane: React.FC<ResizableSplitPaneProps> = ({
  leftPane,
  rightPane,
  initialLeftWidthPercent = 50,
  minLeftWidthPercent = 20,
  maxLeftWidthPercent = 80,
}) => {
  const [leftWidthPercent, setLeftWidthPercent] = useState(initialLeftWidthPercent);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      if (newLeftWidth >= minLeftWidthPercent && newLeftWidth <= maxLeftWidthPercent) {
        setLeftWidthPercent(newLeftWidth);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = 'default';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = '';
    };
  }, [isDragging, minLeftWidthPercent, maxLeftWidthPercent]);

  return (
    <div ref={containerRef} className="flex-1 flex overflow-hidden bg-white w-full h-full relative">
      {/* Left Pane */}
      <div 
        className="h-full overflow-hidden flex flex-col" 
        style={{ width: `${leftWidthPercent}%` }}
      >
        {leftPane}
      </div>

      {/* Draggable Splitter */}
      <div
        className="w-4 bg-slate-50 flex flex-col items-center justify-center relative shrink-0 border-x border-slate-200 cursor-col-resize hover:bg-slate-100 transition-colors z-10"
        onMouseDown={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
      >
        <div className="w-1.5 h-12 bg-slate-300 rounded-full flex flex-col items-center justify-center space-y-1">
          <div className="w-1 h-1 bg-slate-400 rounded-full" />
          <div className="w-1 h-1 bg-slate-400 rounded-full" />
          <div className="w-1 h-1 bg-slate-400 rounded-full" />
        </div>
        
        {/* Invisible hit area expansion */}
        <div className="absolute inset-y-0 -left-2 -right-2 z-20 cursor-col-resize" />
      </div>

      {/* Right Pane */}
      <div 
        className="h-full overflow-hidden flex flex-col" 
        style={{ width: `${100 - leftWidthPercent}%` }}
      >
        {rightPane}
      </div>
      
      {/* Overlay to prevent iframe capturing mouse events while dragging */}
      {isDragging && (
        <div className="absolute inset-0 z-50 cursor-col-resize" />
      )}
    </div>
  );
};
