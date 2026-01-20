
import React, { useState, useRef, useCallback } from 'react';
import { AssetType, CanvasObject } from '../types';
import { COLORS, SVG_ASSETS } from '../constants';
import { Type, Image, Star, Palette, Trash2, Layers } from 'lucide-react';
import DraggableObject from './DraggableObject';

const CanvasTool: React.FC = () => {
  const [objects, setObjects] = useState<CanvasObject[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState('#4ECDC4');
  const canvasRef = useRef<HTMLDivElement>(null);

  const addObject = (type: AssetType, content: string = '') => {
    const id = Math.random().toString(36).substr(2, 9);
    const newObj: CanvasObject = {
      id,
      type,
      x: 100 + (objects.length * 20) % 300,
      y: 100 + (objects.length * 20) % 200,
      width: type === 'text' ? 200 : 100,
      height: type === 'text' ? 60 : 100,
      content: content || (type === 'text' ? 'New Text Idea' : ''),
      color: type === 'color' ? content : selectedColor,
      zIndex: objects.length + 1,
    };
    setObjects([...objects, newObj]);
    setActiveId(id);
  };

  const updateObject = (id: string, updates: Partial<CanvasObject>) => {
    setObjects(prev => prev.map(obj => obj.id === id ? { ...obj, ...updates } : obj));
  };

  const removeObject = (id: string) => {
    setObjects(prev => prev.filter(obj => obj.id !== id));
    setActiveId(null);
  };

  const isOverlappedByHigher = useCallback((id: string, self: CanvasObject) => {
    return objects.some(other => {
      if (other.id === id) return false;
      if (other.zIndex <= self.zIndex) return false;

      // Simple AABB collision detection
      const buffer = 0;
      return (
        self.x < other.x + other.width + buffer &&
        self.x + self.width > other.x - buffer &&
        self.y < other.y + other.height + buffer &&
        self.y + self.height > other.y - buffer
      );
    });
  }, [objects]);

  return (
    <div className="h-full flex">
      {/* Left Panel: Assets (20%) */}
      <aside className="w-1/5 bg-gray-50 border-r border-gray-200 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Assets</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => addObject('text')}
            className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm"
          >
            <Type size={20} />
            <span className="text-[10px] mt-2 font-semibold">TEXT</span>
          </button>
          <button 
            onClick={() => addObject('image', 'https://picsum.photos/200/200')}
            className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm"
          >
            <Image size={20} />
            <span className="text-[10px] mt-2 font-semibold">IMAGE</span>
          </button>
        </div>

        <div>
          <h4 className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-2">
            <Star size={14} /> ICONS
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {SVG_ASSETS.map((svg) => (
              <button 
                key={svg.name}
                onClick={() => addObject('svg', svg.path)}
                className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-gray-600">
                  <path d={svg.path} />
                </svg>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-2">
            <Palette size={14} /> COLORS
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {COLORS.map((color) => (
              <button 
                key={color}
                onClick={() => setSelectedColor(color)}
                style={{ backgroundColor: color }}
                className={`w-8 h-8 rounded-full border-2 transition-transform ${selectedColor === color ? 'border-gray-800 scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
              />
            ))}
          </div>
          <button 
            onClick={() => addObject('color', selectedColor)}
            className="w-full mt-3 py-2 bg-gray-800 text-white text-[10px] font-bold rounded-lg hover:bg-black transition-colors"
          >
            ADD COLOR BLOCK
          </button>
        </div>

        <div className="mt-auto pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
             <span className="text-xs text-gray-400">Layer Stack</span>
             <Layers size={14} className="text-gray-400" />
          </div>
          <p className="text-[10px] text-gray-400 italic">
            Overlapping items below others will be grayed out automatically.
          </p>
        </div>
      </aside>

      {/* Right: Canvas (80%) */}
      <section 
        ref={canvasRef}
        className="w-4/5 relative bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] overflow-hidden"
        onMouseDown={() => setActiveId(null)}
      >
        <div className="absolute top-4 right-4 flex gap-2">
           {activeId && (
              <button 
                onClick={(e) => { e.stopPropagation(); removeObject(activeId); }}
                className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors shadow-lg"
              >
                <Trash2 size={20} />
              </button>
           )}
        </div>

        {objects.map((obj) => (
          <DraggableObject 
            key={obj.id} 
            obj={obj} 
            active={activeId === obj.id}
            isGrayedOut={isOverlappedByHigher(obj.id, obj)}
            onSelect={() => setActiveId(obj.id)}
            onUpdate={(updates) => updateObject(obj.id, updates)}
            canvasRef={canvasRef}
          />
        ))}
      </section>
    </div>
  );
};

export default CanvasTool;
