
import React, { useState, useRef, useEffect } from 'react';
import { Rotate3d, MoveHorizontal } from 'lucide-react';

interface ActionFigure3DViewerProps {
  images: string[];
}

const ActionFigure3DViewer: React.FC<ActionFigure3DViewerProps> = ({ images }) => {
  const [index, setIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const startIdx = useRef(0);

  // Total "virtual" frames to make rotation smoother. 
  // We have 4 images, we can map them to a 360 degree space.
  const numImages = images.length;

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    startX.current = 'touches' in e ? e.touches[0].clientX : e.clientX;
    startIdx.current = index;
  };

  const handleMove = (e: any) => {
    if (!isDragging) return;
    const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const diff = currentX - startX.current;
    
    // Sensitivity: 50 pixels per image swap
    const sensitivity = 50;
    const moveIndex = Math.floor(diff / sensitivity);
    
    let newIndex = (startIdx.current - moveIndex) % numImages;
    if (newIndex < 0) newIndex += numImages;
    
    if (newIndex !== index) {
      setIndex(newIndex);
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', handleEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, index]);

  return (
    <div 
      className="relative w-full aspect-square cursor-grab active:cursor-grabbing select-none"
      onMouseDown={handleStart}
      onTouchStart={handleStart}
    >
      {/* 360 Badge */}
      <div className="absolute top-4 right-4 z-20 flex items-center space-x-1.5 bg-purple-500/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-lg pointer-events-none">
        <Rotate3d size={14} className="text-white animate-spin-slow" />
        <span className="text-[10px] font-black tracking-tighter text-white">360° VIEW</span>
      </div>

      {/* Swipe Hint */}
      {!isDragging && index === 0 && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none animate-in fade-in duration-1000">
           <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center space-x-2 border border-white/10 animate-bounce">
             <MoveHorizontal size={16} className="text-purple-400" />
             <span className="text-[10px] text-white font-bold">左右滑动旋转</span>
           </div>
        </div>
      )}

      {/* Image Stack */}
      <div className="w-full h-full relative bg-[#1a1426] rounded-3xl overflow-hidden shadow-2xl">
        {images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={`Angle ${i}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 pointer-events-none ${
              index === i ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          />
        ))}
      </div>

      {/* Rotation Track Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-1">
        {images.map((_, i) => (
          <div 
            key={i} 
            className={`h-1 rounded-full transition-all duration-300 ${
              index === i ? 'w-4 bg-purple-500' : 'w-1 bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ActionFigure3DViewer;
