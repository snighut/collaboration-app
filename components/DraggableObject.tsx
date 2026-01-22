
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const touchHoldTimer = useRef<NodeJS.Timeout | null>(null);
  const [isHolding, setIsHolding] = useState(false);
  const [isEditingText, setIsEditingText] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastTapTime = useRef<number>(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only process left click
    if (e.button !== 0) {
      return;
    }
    if (obj.type === 'text' && isEditingText) {
      // Allow text interaction when in edit mode
      return;
    }
    e.stopPropagation();
    e.preventDefault();
    onSelect();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - obj.x,
      y: e.clientY - obj.y,
    });
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (obj.type === 'text') {
      e.stopPropagation();
      setIsEditingText(true);
      onSelect();
      // Focus the textarea after state update
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 0);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (obj.type === 'text' && isEditingText) {
      // Allow text interaction when in edit mode
      return;
    }
    e.stopPropagation();
    const touch = e.touches[0];
    const currentTime = new Date().getTime();
    const tapGap = currentTime - lastTapTime.current;
    
    // Check for double tap (within 300ms)
    if (tapGap < 300 && tapGap > 0 && obj.type === 'text') {
      // Double tap detected - enter edit mode
      if (touchHoldTimer.current) {
        clearTimeout(touchHoldTimer.current);
      }
      setIsEditingText(true);
      onSelect();
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 0);
      lastTapTime.current = 0; // Reset
      return;
    }
    
    lastTapTime.current = currentTime;
    onSelect();
    
    // Set up hold timer for 100ms
    touchHoldTimer.current = setTimeout(() => {
      setIsHolding(true);
      setIsDragging(true);
      setDragOffset({
        x: touch.clientX - obj.x,
        y: touch.clientY - obj.y,
      });
    }, 100);
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !canvasRef.current || !isHolding) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const canvasRect = canvasRef.current.getBoundingClientRect();
    let newX = touch.clientX - dragOffset.x;
    let newY = touch.clientY - dragOffset.y;

    // Constrain within canvas
    newX = Math.max(0, Math.min(newX, canvasRect.width - obj.width));
    newY = Math.max(0, Math.min(newY, canvasRect.height - obj.height));

    onUpdate({ x: newX, y: newY });
  }, [isDragging, isHolding, dragOffset, obj, onUpdate, canvasRef]);

  const handleTouchEnd = useCallback(() => {
    if (touchHoldTimer.current) {
      clearTimeout(touchHoldTimer.current);
    }
    setIsDragging(false);
    setIsHolding(false);
  }, []);

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
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      if (touchHoldTimer.current) {
        clearTimeout(touchHoldTimer.current);
      }
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Auto-focus text objects when they become active and have default content
  useEffect(() => {
    if (obj.type === 'text' && active && obj.content === 'New Text Idea' && !isEditingText) {
      setIsEditingText(true);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.select(); // Select all text for easy replacement
        }
      }, 0);
    }
  }, [obj.type, active, obj.content, isEditingText]);

  const baseClasses = `absolute cursor-move select-none transition-[filter,opacity] duration-300 ${active ? 'ring-2 ring-blue-500 shadow-xl z-[100]' : 'shadow-md'}`;
  const grayedClasses = isGrayedOut && !active ? 'opacity-40 grayscale blur-[1px]' : 'opacity-100 grayscale-0 blur-0';

  const renderContent = () => {
    switch (obj.type) {
      case 'text':
        return isEditingText ? (
          <textarea
            ref={textareaRef}
            className="w-full h-full bg-transparent p-2 resize-none outline-none font-medium text-gray-800 dark:text-gray-100"
            value={obj.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            onBlur={() => setIsEditingText(false)}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            placeholder="Double-click to edit"
            autoFocus
            style={{ 
              color: obj.color,
              cursor: 'text',
              fontSize: obj.fontSize ? `${obj.fontSize}px` : '14px',
              fontStyle: obj.fontStyle || 'normal'
            }}
          />
        ) : (
          <div 
            className="w-full h-full p-2 font-medium text-gray-800 dark:text-gray-100 whitespace-pre-wrap break-words pointer-events-none"
            style={{ 
              color: obj.color,
              fontSize: obj.fontSize ? `${obj.fontSize}px` : '14px',
              fontStyle: obj.fontStyle || 'normal'
            }}
          >
            {obj.content || 'Double-click to edit'}
          </div>
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
        return (
          <div 
            className="w-full h-full rounded-lg" 
            style={{ 
              backgroundColor: obj.color,
              border: obj.borderColor && obj.borderWidth ? `${obj.borderWidth}px solid ${obj.borderColor}` : 'none'
            }} 
          />
        );
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
      onTouchStart={handleTouchStart}
      onDoubleClick={handleDoubleClick}
      onContextMenu={(e) => e.preventDefault()}
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
