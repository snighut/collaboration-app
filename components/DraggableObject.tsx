
import React, { useState, useEffect, useCallback } from 'react';
import { CanvasObject } from '../types';

interface DraggableObjectProps {
  obj: CanvasObject;
  active: boolean;
  isGrayedOut: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<CanvasObject>) => void;
  canvasRef: React.RefObject<HTMLDivElement>;
}

const DraggableObject: React.FC<DraggableObjectProps> = ({ 
  obj, active, isGrayedOut, onSelect, onUpdate, canvasRef 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - obj.x,
      y: e.clientY - obj.y,
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    let newX = e.clientX - dragOffset.x;
    let newY = e.clientY - dragOffset.y;

    // Constrain within canvas
    newX = Math.max(0, Math.min(newX, canvasRect.width - obj.width));
    newY = Math.max(0, Math.min(newY, canvasRect.height - obj.height));

    onUpdate({ x: newX, y: newY });
  }, [isDragging, dragOffset, obj, onUpdate, canvasRef]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const baseClasses = `absolute cursor-move select-none transition-[filter,opacity] duration-300 ${active ? 'ring-2 ring-blue-500 shadow-xl z-[100]' : 'shadow-md'}`;
  const grayedClasses = isGrayedOut && !active ? 'opacity-40 grayscale blur-[1px]' : 'opacity-100 grayscale-0 blur-0';

  const renderContent = () => {
    switch (obj.type) {
      case 'text':
        return (
          <textarea
            className="w-full h-full bg-transparent p-2 resize-none outline-none font-medium text-gray-800"
            value={obj.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            onMouseDown={(e) => e.stopPropagation()}
            style={{ color: obj.color }}
          />
        );
      case 'image':
        return <img src={obj.content} alt="Asset" className="w-full h-full object-cover rounded-lg pointer-events-none" />;
      case 'svg':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full p-2 pointer-events-none" style={{ fill: obj.color }}>
            <path d={obj.content} />
          </svg>
        );
      case 'color':
        return <div className="w-full h-full rounded-lg" style={{ backgroundColor: obj.color }} />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`${baseClasses} ${grayedClasses}`}
      style={{
        left: obj.x,
        top: obj.y,
        width: obj.width,
        height: obj.height,
        zIndex: active ? 1000 : obj.zIndex,
        backgroundColor: obj.type === 'text' ? 'white' : 'transparent',
        borderRadius: obj.type === 'image' || obj.type === 'color' ? '8px' : '0px',
      }}
      onMouseDown={handleMouseDown}
    >
      {renderContent()}
      
      {active && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-1 items-center bg-gray-800 text-white text-[8px] px-2 py-1 rounded">
          <span>{Math.round(obj.x)}, {Math.round(obj.y)}</span>
        </div>
      )}
    </div>
  );
};

export default DraggableObject;
