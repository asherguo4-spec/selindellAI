
import React from 'react';

interface ActionFigure3DViewerProps {
  images: string[]; // 虽然只传入一张，但保持数组接口以防万一
}

const ActionFigure3DViewer: React.FC<ActionFigure3DViewerProps> = ({ images }) => {
  const currentImage = images[0];

  return (
    <div className="relative w-full aspect-square select-none">
      {/* Image Container */}
      <div className="w-full h-full bg-[#15101f] rounded-[40px] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] border border-white/5 relative">
        <img 
          src={currentImage}
          alt="Generated Creation"
          className="w-full h-full object-cover"
        />
        
        {/* Subtle Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
      </div>
    </div>
  );
};

export default ActionFigure3DViewer;
