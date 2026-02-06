import React, { useState, useRef, useCallback, useReducer } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import { AssetType, CanvasObject } from '../types';
import { COLORS, SVG_ASSETS } from '../constants';
import { Type, Image, Star, Palette, Trash2, Layers, LayoutTemplate, Minus, ArrowRight, Circle, Square, Triangle } from 'lucide-react';
import { useAuth } from './AuthProvider';
import AuthProviders from './AuthProviders';
import { toast } from 'sonner';

import DraggableObject from './DraggableObject';
import { Save } from 'lucide-react';
import { saveDesign, getDesign } from '../app/actions/designs';

import { useEffect } from 'react';
import { getDesignCache, setDesignCache, clearDesignCache } from '../lib/localCache';
import { canvasReducer, CanvasState } from '../lib/canvasReducer';
import { createDesign } from '@/app/actions/createDesign';

interface CanvasToolProps {
  designId?: string | null;
  onTitleChange?: (title: string) => void;
}

// Define a type for the design data used in CanvasTool
interface CanvasDesign {
  id?: string;
  name: string;
  description: string;
  thumbnail: string | null;
  objects: CanvasObject[];
  connections: Array<{ from: string; to: string; fromPoint: string; toPoint: string }>;
}

const CanvasTool: React.FC<CanvasToolProps> = ({ designId, onTitleChange }) => {
  const { session, loading: authLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [resetInteraction, setResetInteraction] = useState(0);
    // PATCH CANVAS panel state
    const [patchJson, setPatchJson] = useState('');
    const [patchError, setPatchError] = useState('');
  // Save state for feedback
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Centralized canvas state using reducer
  const [canvasState, dispatch] = useReducer(canvasReducer, {
    name: '',
    description: '',
    thumbnail: null,
    objects: [],
    connections: [],
  });

  // Key for localStorage cache
  const localCacheKey = designId ? `design-cache-${designId}` : 'design-cache-new';

  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState('#4ECDC4');

  // Fetch design data if designId is provided, with localStorage cache restore
  useEffect(() => {
    if (authLoading) return;
    // Try to restore from localCache utility first
    const cached = getDesignCache<CanvasState>(localCacheKey);
    if (cached) {
      dispatch({ type: 'SET_STATE', payload: cached });
      if (onTitleChange) onTitleChange(cached.name);
      return; // Skip fetching from server if cache exists
    }
    if (designId && designId !== 'new') {
      setLoading(true);
      setLoadError(null);
      getDesign(designId, session?.access_token)
        .then((result) => {
          if (result.success && result.data) {
            // Prefer data.objects if present, else fallback to items
            let objects: CanvasObject[] = [];
            if (result.data.data && Array.isArray(result.data.data.objects)) {
              objects = result.data.data.objects as CanvasObject[];
            } else if (Array.isArray(result.data.items)) {
              objects = result.data.items as CanvasObject[];
            }
            // Prefer data.connections if present, else fallback to connections
            let connections: Array<{ from: string; to: string; fromPoint: string; toPoint: string }> = [];
            if (result.data.data && Array.isArray(result.data.data.connections)) {
              connections = result.data.data.connections as any;
            } else if (Array.isArray(result.data.connections)) {
              connections = result.data.connections as any;
            }
            const newDesignData = {
              id: result.data.id,
              name: result.data.name || '',
              description: result.data.description || '',
              thumbnail: result.data.thumbnail || null,
              objects,
              connections,
            };
            dispatch({ type: 'SET_STATE', payload: newDesignData });
            if (onTitleChange) onTitleChange(newDesignData.name);
          } else {
            setLoadError(result.error || 'Failed to load design');
          }
        })
        .catch((e) => setLoadError(e?.message || 'Unknown error'))
        .finally(() => setLoading(false));
    }
  }, [designId, authLoading, session?.access_token, onTitleChange]);

  // Sync cache and onTitleChange on every canvasState change
  useEffect(() => {
    if (onTitleChange) onTitleChange(canvasState.name);
    // Only cache if canvas has objects or connections
    if ((canvasState.objects && canvasState.objects.length > 0) || (canvasState.connections && canvasState.connections.length > 0)) {
      setDesignCache(localCacheKey, canvasState);
    }
  }, [canvasState, onTitleChange]);

  // Save handler      
  const handleSave = async () => {
    if (!session) {
      if (typeof window !== 'undefined') {
        const fullPath = window.location.pathname + window.location.search;
        window.location.href = `/login?redirect=${encodeURIComponent(fullPath)}`;
        return;
      }
      setShowAuthModal(true);
      return;
    }

    setSaving(true);
    setSaveSuccess(false);
    const id = designId || canvasState.id;
    const payload = {
      name: canvasState.name || 'Untitled Design',
      description: canvasState.description || '',
      thumbnail: canvasState.thumbnail,
      data: {
        objects: canvasState.objects,
        connections: canvasState.connections,
      },
    };
    const accessToken = session?.access_token;
    try {
      let result;
      let newId = id;
      if (!id || id === 'new') {
        result = await createDesign({ ...payload }, accessToken);
        if (result.success && result.id) {
          // Update the URL to use the new id
          if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('id', result.id);
            window.history.replaceState({}, '', url.toString());
          }
          newId = result.id;
        }
      } else {
        result = await saveDesign({ ...payload }, id, accessToken);
      }
      if (!result.success){
        toast.error(result.error || 'Failed to create/save design');
      }
      setSaving(false);
      setSaveSuccess(result.success);
      setTimeout(() => setSaveSuccess(false), 1200);
      // After creation, always use saveDesign for future saves
      if (!id || id === 'new') {
        dispatch({ type: 'SET_STATE', payload: { id: newId } });
      }
      // Clear localStorage cache after successful save
      if (result.success) {
        clearDesignCache(localCacheKey);
      }
    } catch (e) {
      setSaving(false);
      setSaveSuccess(false);
    }
  };
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [textInputPosition, setTextInputPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDraggingConnection, setIsDraggingConnection] = useState(false);
  const [connectionDragStart, setConnectionDragStart] = useState<{ objId: string; anchorPosition: string; x: number; y: number } | null>(null);
  const [connectionDragEnd, setConnectionDragEnd] = useState<{ x: number; y: number } | null>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageDimensions, setStageDimensions] = useState({ width: 800, height: 600 });

  const addObject = (type: AssetType, content: string = '') => {
    const id = Math.random().toString(36).substr(2, 9);
    const baseObj = {
      id,
      type,
      x: 100 + (canvasState.objects.length * 20) % 300,
      y: 100 + (canvasState.objects.length * 20) % 200,
      content: content || (type === 'text' ? 'New Text Idea' : ''),
      zIndex: canvasState.objects.length + 1,
    };
    let newObj: CanvasObject;
    switch (type) {
      case 'text':
        newObj = { ...baseObj, width: 200, height: 60, color: '#000000' };
        break;
      case 'line':
        newObj = { 
          ...baseObj, 
          width: 150, 
          height: 2, 
          color: selectedColor,
          points: [0, 0, 150, 0] // horizontal line
        };
        break;
      case 'arrow':
        newObj = { 
          ...baseObj, 
          width: 150, 
          height: 20, 
          color: selectedColor,
          points: [0, 10, 150, 10], // horizontal arrow
          content: 'arrow'
        };
        break;
      case 'circle':
        newObj = { ...baseObj, width: 80, height: 80, color: selectedColor };
        break;
      case 'rectangle':
        newObj = { ...baseObj, width: 120, height: 80, color: selectedColor };
        break;
      case 'triangle':
        newObj = { ...baseObj, width: 100, height: 100, color: selectedColor };
        break;
      case 'color':
        newObj = { ...baseObj, width: 100, height: 100, color: content || selectedColor };
        break;
      case 'image':
      case 'svg':
      default:
        newObj = { 
          ...baseObj, 
          width: 100, 
          height: 100, 
          color: selectedColor 
        };
    }
    dispatch({ type: 'ADD_OBJECT', payload: newObj });
    setActiveId(id);
  };

  const updateObject = (id: string, updates: Partial<CanvasObject>) => {
    dispatch({ type: 'UPDATE_OBJECT', id, updates });
  };

  const removeObject = (id: string) => {
    dispatch({ type: 'REMOVE_OBJECT', id });
    setActiveId(null);
  };

  const isOverlappedByHigher = useCallback((id: string, self: CanvasObject) => {
    return canvasState.objects.some(other => {
      if (other.id === id) return false;
      if (other.zIndex <= self.zIndex) return false;
      const buffer = 0;
      return (
        self.x < other.x + other.width + buffer &&
        self.x + self.width > other.x - buffer &&
        self.y < other.y + other.height + buffer &&
        self.y + self.height > other.y - buffer
      );
    });
  }, [canvasState.objects]);

  // Helper to get anchor point position in absolute coordinates
  const getAnchorPosition = (objId: string, position: string) => {
    const obj = canvasState.objects.find(o => o.id === objId);
    if (!obj) return { x: 0, y: 0 };
    let x = obj.x;
    let y = obj.y;
    if (obj.type === 'line' || obj.type === 'arrow') {
      const points = obj.points || [0, 0, obj.width, 0];
      if (position === 'start') {
        x += points[0];
        y += points[1];
      } else {
        x += points[2];
        y += points[3];
      }
    } else {
      switch (position) {
        case 'top':
          x += obj.width / 2;
          break;
        case 'right':
          x += obj.width;
          y += obj.height / 2;
          break;
        case 'bottom':
          x += obj.width / 2;
          y += obj.height;
          break;
        case 'left':
          y += obj.height / 2;
          break;
      }
    }
    return { x, y };
  };

  // Handler for starting a connection drag from an anchor
  const handleAnchorDragStart = (objId: string, anchorPosition: string, x: number, y: number) => {
    setIsDraggingConnection(true);
    setConnectionDragStart({ objId, anchorPosition, x, y });
    setConnectionDragEnd({ x, y });
  };

  // Handler for dragging the connection line
  const handleConnectionDrag = (x: number, y: number) => {
    if (isDraggingConnection) {
      setConnectionDragEnd({ x, y });
    }
  };

  // Helper to get all anchor points for an object
  const getObjectAnchorPoints = (obj: CanvasObject) => {
    const points: { x: number; y: number; position: string }[] = [];
    if (obj.type === 'line' || obj.type === 'arrow') {
      const linePoints = obj.points || [0, 0, obj.width, 0];
      points.push(
        { x: obj.x + linePoints[0], y: obj.y + linePoints[1], position: 'start' },
        { x: obj.x + linePoints[2], y: obj.y + linePoints[3], position: 'end' }
      );
    } else {
      points.push(
        { x: obj.x + obj.width / 2, y: obj.y, position: 'top' },
        { x: obj.x + obj.width, y: obj.y + obj.height / 2, position: 'right' },
        { x: obj.x + obj.width / 2, y: obj.y + obj.height, position: 'bottom' },
        { x: obj.x, y: obj.y + obj.height / 2, position: 'left' }
      );
    }
    return points;
  };

  // Helper to find nearest anchor point on target object
  const findNearestAnchor = (targetObj: CanvasObject, x: number, y: number) => {
    const anchors = getObjectAnchorPoints(targetObj);
    let nearestAnchor = anchors[0];
    let minDistance = Infinity;
    anchors.forEach(anchor => {
      const distance = Math.sqrt(
        Math.pow(anchor.x - x, 2) + Math.pow(anchor.y - y, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestAnchor = anchor;
      }
    });
    return nearestAnchor.position;
  };

  // Handler for ending a connection drag
  const handleAnchorDragEnd = (x: number, y: number) => {
    if (!isDraggingConnection || !connectionDragStart) return;
    const stage = stageRef.current;
    if (!stage) {
      setIsDraggingConnection(false);
      setConnectionDragStart(null);
      setConnectionDragEnd(null);
      setResetInteraction((v) => v + 1);
      return;
    }
    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) {
      setIsDraggingConnection(false);
      setConnectionDragStart(null);
      setConnectionDragEnd(null);
      setResetInteraction((v) => v + 1);
      return;
    }
    const targetObj = canvasState.objects.find(obj => {
      if (obj.id === connectionDragStart.objId) return false;
      return (
        pointerPos.x >= obj.x &&
        pointerPos.x <= obj.x + obj.width &&
        pointerPos.y >= obj.y &&
        pointerPos.y <= obj.y + obj.height
      );
    });
    if (targetObj) {
      // Create connection between existing objects
      const nearestAnchor = findNearestAnchor(targetObj, pointerPos.x, pointerPos.y);
      dispatch({
        type: 'ADD_CONNECTION',
        payload: {
          from: connectionDragStart.objId,
          to: targetObj.id,
          fromPoint: connectionDragStart.anchorPosition,
          toPoint: nearestAnchor
        }
      });
      setActiveId(targetObj.id);
      setResetInteraction((v) => v + 1);
    } else {
      // No target found - duplicate the source object at cursor position
      const sourceObj = canvasState.objects.find(o => o.id === connectionDragStart.objId);
      if (sourceObj) {
        const newId = Math.random().toString(36).substr(2, 9);
        const newObj: CanvasObject = {
          ...sourceObj,
          id: newId,
          x: pointerPos.x - sourceObj.width / 2,
          y: pointerPos.y - sourceObj.height / 2,
          zIndex: canvasState.objects.length + 1,
        };
        const nearestAnchor = findNearestAnchor(newObj, pointerPos.x, pointerPos.y);
        dispatch({ type: 'ADD_OBJECT', payload: newObj });
        dispatch({
          type: 'ADD_CONNECTION',
          payload: {
            from: connectionDragStart.objId,
            to: newId,
            fromPoint: connectionDragStart.anchorPosition,
            toPoint: nearestAnchor
          }
        });
        setActiveId(newId);
        setResetInteraction((v) => v + 1);
      }
    }
    setIsDraggingConnection(false);
    setConnectionDragStart(null);
    setConnectionDragEnd(null);
    setResetInteraction((v) => v + 1);
  };

// Update stage dimensions on container resize
  React.useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setStageDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-gray-500">Loading design...</span>
      </div>
    );
  }
  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-red-500">{loadError}</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col md:flex-row">
       {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[3000]">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-center">
              Sign In to Save
            </h2>
            <div className="mb-6 text-center text-gray-700 dark:text-gray-200 text-lg font-medium">
              Continue with
            </div>
            <AuthProviders redirect={typeof window !== 'undefined' ? window.location.pathname + window.location.search : undefined} />
            <button
              onClick={() => setShowAuthModal(false)}
              className="mt-4 w-full text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* Save icon for mobile/iPhone view */}
      <div className="fixed top-20 right-4 z-[2000] flex items-center md:hidden mr-12">
        <button
          onClick={handleSave}
          className="p-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 active:bg-blue-800 transition-colors"
          disabled={saving}
          aria-label="Save Design"
        >
          {saving ? (
            <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" fill="none" opacity="0.3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="4" fill="none"/></svg>
          ) : saveSuccess ? (
            <span className="text-xs font-bold">Saved!</span>
          ) : (
            <Save size={24} />
          )}
        </button>
      </div>
      {/* Save button for desktop view */}
      <div className="fixed top-3 right-3 z-[2000] hidden md:flex items-center">
        <button
          onClick={handleSave}
          className="px-5 py-2 rounded-lg bg-blue-600 text-white font-bold shadow-lg hover:bg-blue-700 active:bg-blue-800 transition-colors text-base"
          disabled={saving}
        >
          {saving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save'}
        </button>
      </div>
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
          <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3">
            LINES & ARROWS
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => addObject('line')}
              className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-900 dark:text-gray-100"
            >
              <Minus size={18} />
              <span className="text-[9px] mt-1 font-semibold">LINE</span>
            </button>
            <button 
              onClick={() => {
                const id = Math.random().toString(36).substr(2, 9);
                const newObj: CanvasObject = {
                  id,
                  type: 'line' as AssetType,
                  x: 100 + (canvasState.objects.length * 20) % 300,
                  y: 100 + (canvasState.objects.length * 20) % 200,
                  width: 150,
                  height: 2,
                  content: '',
                  color: selectedColor,
                  strokeDashArray: [10, 5],
                  points: [0, 0, 150, 0],
                  zIndex: canvasState.objects.length + 1,
                };
                // Only define pageObj where x, y, width, height are in scope
                dispatch({ type: 'ADD_OBJECT', payload: newObj });
                setActiveId(id);
              }}
              className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-900 dark:text-gray-100"
            >
              <div className="border-t-2 border-dashed w-5 border-current" />
              <span className="text-[9px] mt-1 font-semibold">DOTTED</span>
            </button>
            <button 
              onClick={() => addObject('arrow')}
              className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-900 dark:text-gray-100"
            >
              <ArrowRight size={18} />
              <span className="text-[9px] mt-1 font-semibold">ARROW</span>
            </button>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3">
            SHAPES
          </h4>
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => addObject('circle')}
              className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-900 dark:text-gray-100"
            >
              <Circle size={18} />
              <span className="text-[9px] mt-1 font-semibold">CIRCLE</span>
            </button>
            <button 
              onClick={() => addObject('rectangle')}
              className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-900 dark:text-gray-100"
            >
              <Square size={18} />
              <span className="text-[9px] mt-1 font-semibold">RECT</span>
            </button>
            <button 
              onClick={() => addObject('triangle')}
              className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-900 dark:text-gray-100"
            >
              <Triangle size={18} />
              <span className="text-[9px] mt-1 font-semibold">TRIANGLE</span>
            </button>
          </div>
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
                onClick={() => {
                  setSelectedColor(color);
                  // If there's an active object, apply color based on type
                  if (activeId) {
                    const activeObj = canvasState.objects.find(obj => obj.id === activeId);
                    if (activeObj) {
                      if (activeObj.type === 'text') {
                        // Change text background color
                        updateObject(activeId, { backgroundColor: color });
                      } else if (activeObj.type === 'svg') {
                        // Change SVG icon color
                        updateObject(activeId, { color });
                      }
                      // Do nothing for image assets
                    }
                  }
                }}
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
                // Get canvas dimensions
                const canvasHeight = stageDimensions.height;
                const canvasWidth = stageDimensions.width;
                
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
                  zIndex: canvasState.objects.length + 1,
                };
                dispatch({ type: 'ADD_OBJECT', payload: pageObj });
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
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-2">
              💡 Connection Points
            </h4>
            <p className="text-[10px] text-gray-600 dark:text-gray-400 leading-relaxed">
              Select any object to see small blue circles at its boundaries. Click these circles to create connections between objects.
            </p>
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
            const activeObj = canvasState.objects.find(obj => obj.id === activeId);
            if (!activeObj) {
              return JSON.stringify({
                canvas: {
                  objectCount: canvasState.objects.length,
                  activeObject: null
                },
                message: "No object selected"
              }, null, 2);
            }
            
            const debugInfo: any = {
              canvas: {
                objectCount: canvasState.objects.length
              },
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

                {/* PATCH CANVAS Panel */}
        <div>
          <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3">PATCH CANVAS</h4>
          <textarea
            id="patch-canvas-json"
            style={{ color: 'green', backgroundColor: 'rgb(0 0 0 / 1)' }}
            className="w-full min-h-[80px] max-h-40 p-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-800 text-xs font-mono mb-2"
            placeholder="Paste JSON object here..."
            value={patchJson}
            onChange={e => { setPatchJson(e.target.value); setPatchError(''); }}
          />
          {patchError && (
            <div className="text-xs text-red-500 mb-2">{patchError}</div>
          )}
          <button
            className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
            onClick={() => {
              try {
                const obj = JSON.parse(patchJson);
                // Validate structure
                if (!obj.objects || !Array.isArray(obj.objects) || !obj.connections || !Array.isArray(obj.connections)) {
                  setPatchError('JSON must have "objects" and "connections" arrays.');
                  return;
                }
                dispatch({ type: 'SET_STATE', payload: { objects: obj.objects, connections: obj.connections } });
                setPatchError('');
              } catch (e) {
                setPatchError('Invalid JSON: ' + (e.message || e));
              }
            }}
          >Apply</button>
        </div>
      </aside>

      {/* Right: Canvas (80%) */}
      <section 
        ref={containerRef}
        className="w-full md:w-4/5 h-[60%] md:h-full relative bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#475569_1px,transparent_1px)] [background-size:20px_20px] overflow-hidden"
      >
        <div className="absolute top-4 right-4 flex gap-2 z-[1001]">
           {activeId && (
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  removeObject(activeId); 
                }}
                className="p-2 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-full hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors shadow-lg"
              >
                <Trash2 size={20} />
              </button>
           )}
        </div>

        <Stage
          ref={stageRef}
          width={stageDimensions.width}
          height={stageDimensions.height}
          onMouseDown={(e) => {
            // Don't deselect if dragging connection
            if (isDraggingConnection) return;
            
            // Deselect when clicking on empty canvas
            const clickedOnEmpty = e.target === e.target.getStage();
            if (clickedOnEmpty) {
              setActiveId(null);
              setEditingTextId(null);
              setTextInputPosition(null);
            }
          }}
          onMouseMove={(e) => {
            if (isDraggingConnection) {
              const pos = e.target.getStage()?.getPointerPosition();
              if (pos) {
                handleConnectionDrag(pos.x, pos.y);
              }
            }
          }}
          onMouseUp={(e) => {
            if (isDraggingConnection) {
              const pos = e.target.getStage()?.getPointerPosition();
              if (pos) {
                handleAnchorDragEnd(pos.x, pos.y);
              }
            }
          }}
          onTouchStart={(e) => {
            // Don't deselect if dragging connection
            if (isDraggingConnection) return;
            
            const clickedOnEmpty = e.target === e.target.getStage();
            if (clickedOnEmpty) {
              setActiveId(null);
              setEditingTextId(null);
              setTextInputPosition(null);
            }
          }}
          onTouchMove={(e) => {
            if (isDraggingConnection) {
              const pos = e.target.getStage()?.getPointerPosition();
              if (pos) {
                handleConnectionDrag(pos.x, pos.y);
              }
            }
          }}
          onTouchEnd={(e) => {
            if (isDraggingConnection) {
              const pos = e.target.getStage()?.getPointerPosition();
              if (pos) {
                handleAnchorDragEnd(pos.x, pos.y);
              }
            }
          }}
        >
          <Layer>
            {/* Render connection lines between objects */}
            {canvasState.connections.map((conn, index) => {
              const fromPos = getAnchorPosition(conn.from, conn.fromPoint);
              const toPos = getAnchorPosition(conn.to, conn.toPoint);
              return (
                <Line
                  key={`connection-${index}`}
                  points={[fromPos.x, fromPos.y, toPos.x, toPos.y]}
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dash={[10, 5]}
                  opacity={0.7}
                />
              );
            })}
            
            {/* Render dragging connection line */}
            {isDraggingConnection && connectionDragStart && connectionDragEnd && (
              <Line
                points={[
                  connectionDragStart.x,
                  connectionDragStart.y,
                  connectionDragEnd.x,
                  connectionDragEnd.y
                ]}
                stroke="#3B82F6"
                strokeWidth={3}
                dash={[10, 5]}
                opacity={0.8}
              />
            )}
            
            {/* Render all objects */}
            {canvasState.objects.map((obj) => (
              <DraggableObject 
                key={obj.id} 
                obj={obj} 
                active={activeId === obj.id}
                isGrayedOut={isOverlappedByHigher(obj.id, obj)}
                onSelect={() => {
                  // Close any open text editing when selecting a different object
                  if (activeId !== obj.id) {
                    setEditingTextId(null);
                    setTextInputPosition(null);
                  }
                  setActiveId(obj.id);
                }}
                onUpdate={(updates) => updateObject(obj.id, updates)}
                onStartTextEdit={(position) => {
                  setEditingTextId(obj.id);
                  setTextInputPosition(position);
                  setTimeout(() => {
                    if (textInputRef.current) {
                      textInputRef.current.focus();
                      textInputRef.current.select();
                    }
                  }, 0);
                }}
                onAnchorDragStart={(anchorPosition, x, y) => {
                  handleAnchorDragStart(obj.id, anchorPosition, x, y);
                }}
                resetInteraction={resetInteraction}
              />
            ))}
          </Layer>
        </Stage>

        {/* Text editing overlay - completely outside Konva */}
        {editingTextId && textInputPosition && typeof document !== 'undefined' && (() => {
          const editingObj = canvasState.objects.find(o => o.id === editingTextId);
          if (!editingObj || editingObj.type !== 'text') return null;
          
          return (
            <textarea
              ref={textInputRef}
              value={editingObj.content}
              onChange={(e) => updateObject(editingTextId, { content: e.target.value })}
              onBlur={() => {
                setEditingTextId(null);
                setTextInputPosition(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setEditingTextId(null);
                  setTextInputPosition(null);
                }
              }}
              style={{
                position: 'fixed',
                left: `${textInputPosition.x}px`,
                top: `${textInputPosition.y}px`,
                width: `${editingObj.width}px`,
                height: `${editingObj.height}px`,
                fontSize: `${editingObj.fontSize || 14}px`,
                fontStyle: editingObj.fontStyle || 'normal',
                color: editingObj.color || '#000000',
                backgroundColor: editingObj.backgroundColor || 'white',
                padding: '8px',
                border: '2px solid #3B82F6',
                outline: 'none',
                resize: 'none',
                zIndex: 10000,
                fontFamily: 'inherit',
              }}
            />
          );
        })()}
      </section>
    </div>
  );
};

export default CanvasTool;
