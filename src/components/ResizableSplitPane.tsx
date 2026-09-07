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
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
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
        className="w-3.5 bg-slate-100 flex flex-col items-center justify-center relative shrink-0 border-x border-slate-300 cursor-ew-resize hover:bg-slate-200 transition-colors z-10 select-none group"
        onMouseDown={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        title="Drag to resize panes"
      >
        <div className="w-1 h-10 bg-slate-300 group-hover:bg-slate-400 rounded-full flex flex-col items-center justify-center space-y-1 transition-colors pointer-events-none">
          <div className="w-0.5 h-0.5 bg-slate-500 rounded-full" />
          <div className="w-0.5 h-0.5 bg-slate-500 rounded-full" />
          <div className="w-0.5 h-0.5 bg-slate-500 rounded-full" />
        </div>
      </div>

      {/* Right Pane */}
      <div 
        className="h-full overflow-hidden flex flex-col" 
        style={{ width: `${100 - leftWidthPercent}%` }}
      >
        {rightPane}
      </div>
      
      {/* Overlay to prevent text selection capturing mouse events while dragging */}
      {isDragging && (
        <div className="absolute inset-0 z-50 cursor-ew-resize select-none" />
      )}
    </div>
  );
};
