import React, { useState, useRef } from 'react';
import { Columns, SplitSquareVertical, ZoomIn } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeUrl?: string | null;
  afterUrl?: string | null;
  beforeLabel?: string;
  afterLabel?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeUrl,
  afterUrl,
  beforeLabel = "BEFORE 5S (Opportunity / Hazard)",
  afterLabel = "AFTER 5S (Standardized Kaizen)"
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider');
  const containerRef = useRef<HTMLDivElement>(null);

  const fallbackBefore = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800";
  const actualBefore = beforeUrl || fallbackBefore;

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging && e.type !== 'touchmove') return;
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  return (
    <div className="w-full select-none">
      {/* Controls Bar */}
      <div className="flex items-center justify-between pb-2 mb-2 text-xs text-slate-500 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <span className="font-semibold uppercase tracking-wider text-slate-700">Visual Evidence Inspector</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[11px]">
            {afterUrl ? "Complete Pair Verified" : "Pending After Photo"}
          </span>
        </div>
        <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setViewMode('slider')}
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center space-x-1 transition-all ${
              viewMode === 'slider'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span>Interactive Slider</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('side-by-side')}
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center space-x-1 transition-all ${
              viewMode === 'side-by-side'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Side-by-Side</span>
          </button>
        </div>
      </div>

      {viewMode === 'side-by-side' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Before Box */}
          <div className="relative group overflow-hidden rounded-xl border border-rose-200 bg-slate-900 aspect-video shadow-md">
            <img
              src={actualBefore}
              alt="Before 5S"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-rose-600/90 text-white font-bold text-xs tracking-wider uppercase shadow-lg backdrop-blur-sm">
              {beforeLabel}
            </div>
          </div>

          {/* After Box */}
          <div className="relative group overflow-hidden rounded-xl border border-emerald-200 bg-slate-900 aspect-video shadow-md">
            {afterUrl ? (
              <>
                <img
                  src={afterUrl}
                  alt="After 5S"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-emerald-600/90 text-white font-bold text-xs tracking-wider uppercase shadow-lg backdrop-blur-sm">
                  {afterLabel}
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-50 border-2 border-dashed border-slate-300">
                <ZoomIn className="w-8 h-8 text-slate-400 mb-2" />
                <p className="text-sm font-semibold text-slate-700">After Evidence Pending</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Upload completed Kaizen photo during review submission to activate side-by-side verification.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Slider Mode */
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchMove={handleMouseMove}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          className="relative overflow-hidden rounded-xl border border-slate-300 bg-slate-950 aspect-video shadow-lg cursor-ew-resize select-none"
        >
          {afterUrl ? (
            <>
              {/* After Image (Background layer) */}
              <img
                src={afterUrl}
                alt="After 5S"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-emerald-600/90 text-white font-bold text-xs tracking-wider uppercase shadow-lg backdrop-blur-sm pointer-events-none">
                {afterLabel}
              </div>

              {/* Before Image (Clipped layer) */}
              <div
                className="absolute inset-y-0 left-0 overflow-hidden"
                style={{ width: `${sliderPosition}%` }}
              >
                <img
                  src={actualBefore}
                  alt="Before 5S"
                  className="absolute inset-0 w-full h-full object-cover max-w-none"
                  style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%' }}
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-rose-600/90 text-white font-bold text-xs tracking-wider uppercase shadow-lg backdrop-blur-sm pointer-events-none">
                  {beforeLabel}
                </div>
              </div>

              {/* Draggable Divider Bar */}
              <div
                className="absolute inset-y-0 w-1 bg-white shadow-[0_0_12px_rgba(0,0,0,0.6)] cursor-ew-resize flex items-center justify-center pointer-events-none"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="w-8 h-8 rounded-full bg-white border-2 border-indigo-600 shadow-xl flex items-center justify-center text-indigo-700 pointer-events-auto">
                  <SplitSquareVertical className="w-4 h-4" />
                </div>
              </div>
            </>
          ) : (
            <div className="relative w-full h-full">
              <img
                src={actualBefore}
                alt="Before 5S"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-rose-600/90 text-white font-bold text-xs tracking-wider uppercase shadow-lg">
                {beforeLabel}
              </div>
              <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-slate-900/80 text-white text-xs backdrop-blur-md border border-slate-700">
                After evidence photo required for slider view
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
