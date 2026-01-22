
import React, { useState, useRef, useCallback } from 'react';
import { AssetType, CanvasObject } from '../types';
import { COLORS, SVG_ASSETS } from '../constants';
import { Type, Image, Star, Palette, Trash2, Layers, LayoutTemplate } from 'lucide-react';
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
    <div className="h-full flex flex-col md:flex-row">
      {/* Left Panel: Assets (20%) */}
      <aside className="w-full md:w-1/5 h-[40%] md:h-full bg-gray-50 dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
        <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Assets</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => addObject('text')}
            className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-sm text-gray-900 dark:text-gray-100"
          >
            <Type size={20} />
            <span className="text-[10px] mt-2 font-semibold">TEXT</span>
          </button>
          <button 
            onClick={() => addObject('image', 'https://picsum.photos/200/200')}
            className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-sm text-gray-900 dark:text-gray-100"
          >
            <Image size={20} />
            <span className="text-[10px] mt-2 font-semibold">IMAGE</span>
          </button>
        </div>

        <div>
          <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
            <Star size={14} /> ICONS
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {SVG_ASSETS.map((svg) => (
              <button 
                key={svg.name}
                onClick={() => addObject('svg', svg.path)}
                className="p-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 flex items-center justify-center"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-gray-600 dark:text-gray-300">
                  <path d={svg.path} />
                </svg>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
            <Palette size={14} /> COLORS
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {COLORS.map((color) => (
              <button 
                key={color}
                onClick={() => setSelectedColor(color)}
                style={{ backgroundColor: color }}
                className={`w-8 h-8 rounded-full border-2 transition-transform ${selectedColor === color ? 'border-gray-800 dark:border-gray-200 scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
              />
            ))}
          </div>
          <button 
            onClick={() => addObject('color', selectedColor)}
            className="w-full mt-3 py-2 bg-gray-800 dark:bg-slate-600 text-white text-[10px] font-bold rounded-lg hover:bg-black dark:hover:bg-slate-500 transition-colors"
          >
            ADD COLOR BLOCK
          </button>
        </div>

        <div>
          <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
            <LayoutTemplate size={14} /> LAYOUTS
          </h4>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                if (!canvasRef.current) return;
                
                // Get canvas dimensions
                const canvasRect = canvasRef.current.getBoundingClientRect();
                const canvasHeight = canvasRect.height;
                const canvasWidth = canvasRect.width;
                
                // Calculate dimensions for 80% vertical height with 8.5:11 aspect ratio
                const height = canvasHeight * 0.8;
                const width = height * (8.5 / 11);
                
                // Center the layout
                const x = (canvasWidth - width) / 2;
                const y = (canvasHeight - height) / 2;
                
                // Add a single page layout (8.5 x 11 rectangle)
                const id = Math.random().toString(36).substr(2, 9);
                const pageObj: CanvasObject = {
                  id,
                  type: 'color',
                  x,
                  y,
                  width,
                  height,
                  content: '',
                  color: 'transparent',
                  borderColor: '#3B82F6',
                  borderWidth: 3,
                  zIndex: objects.length + 1,
                };
                setObjects([...objects, pageObj]);
                setActiveId(id);
              }}
              className="flex items-center justify-center p-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-all"
              title="Single Page (8.5x11)"
            >
              <svg width="50" height="50" viewBox="0 0 50 50" className="w-full h-full">
                <rect
                  x="6"
                  y="0"
                  width="38"
                  height="50"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-gray-400 dark:text-gray-500"
                  rx="2"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
             <span className="text-xs text-gray-400 dark:text-gray-500">Everything below is for development environment</span>
             <Layers size={14} className="text-gray-400 dark:text-gray-500" />
          </div>
        </div>

        <div className="order-t border-gray-200 dark:border-slate-700">
          <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3">
            DEBUG PANEL
          </h4>
          <pre className="text-[9px] bg-gray-900 dark:bg-black text-green-400 p-3 rounded-lg overflow-auto max-h-48 font-mono">
{(() => {
  const activeObj = objects.find(obj => obj.id === activeId);
  if (!activeObj) {
    return JSON.stringify({
      canvas: {
        objectCount: objects.length,
        activeObject: null
      },
      message: "No object selected"
    }, null, 2);
  }
  
  const debugInfo: any = {
    type: activeObj.type,
    id: activeObj.id,
    position: {
      x: Math.round(activeObj.x),
      y: Math.round(activeObj.y)
    },
    dimensions: {
      width: Math.round(activeObj.width),
      height: Math.round(activeObj.height)
    },
    zIndex: activeObj.zIndex
  };
  
  if (activeObj.type === 'text') {
    debugInfo.text = {
      content: activeObj.content,
      length: activeObj.content.length,
      cursorPosition: activeObj.cursorPosition ?? 0,
      fontSize: activeObj.fontSize || 14,
      fontStyle: activeObj.fontStyle || 'normal',
      color: activeObj.color
    };
  } else if (activeObj.type === 'image') {
    debugInfo.image = {
      url: activeObj.content,
      dimensions: `${Math.round(activeObj.width)}x${Math.round(activeObj.height)}`
    };
  } else if (activeObj.type === 'svg') {
    debugInfo.svg = {
      pathLength: activeObj.content.length,
      color: activeObj.color
    };
  } else if (activeObj.type === 'color') {
    debugInfo.color = {
      value: activeObj.color,
      borderColor: activeObj.borderColor,
      borderWidth: activeObj.borderWidth
    };
  }
  
  return JSON.stringify(debugInfo, null, 2);
})()}
          </pre>
        </div>
      </aside>

      {/* Right: Canvas (80%) */}
      <section 
        ref={canvasRef}
        className="w-full md:w-4/5 h-[60%] md:h-full relative bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#475569_1px,transparent_1px)] [background-size:20px_20px] overflow-hidden"
        onMouseDown={() => setActiveId(null)}
      >
        <div className="absolute top-4 right-4 flex gap-2">
           {activeId && (
              <button 
                onClick={(e) => { e.stopPropagation(); removeObject(activeId); }}
                className="p-2 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-full hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors shadow-lg"
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
