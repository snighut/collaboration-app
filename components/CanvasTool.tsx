import React, { useState, useRef, useCallback, useReducer } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import { AssetType, CanvasObject, Connection } from '../types';
import { COLORS, SVG_ASSETS, ARCHITECTURE_COMPONENTS } from '../constants';
import { Star, Palette, Trash2, Layers, Network, Server, Database, Cloud, Cpu, HardDrive, Globe, Smartphone, Monitor, Shield, Activity, Plus, ChevronDown, ChevronUp, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useAuth } from './AuthProvider';
import AuthProviders from './AuthProviders';
import { toast } from 'sonner';

import DraggableObject from './DraggableObject';
import ConnectionRenderer from './ConnectionRenderer';
import DesignGroupRenderer from './DesignGroupRenderer';
import { Save } from 'lucide-react';
import { saveDesign, getDesign } from '../app/actions/designs';
import { uploadThumbnail } from '../app/actions/uploadThumbnail';
import { generateThumbnailFromStage } from '../lib/thumbnailGenerator';

import { useEffect } from 'react';
import { getDesignCache, setDesignCache, clearDesignCache } from '../lib/localCache';
import { canvasReducer, CanvasState } from '../lib/canvasReducer';
import { createDesign } from '@/app/actions/createDesign';
import { transformFromBackendSchema, transformToBackendSchema } from '../lib/schemaTransform';
import { ConnectionType, getConnectionTypesByCategory, getConnectionTypeDefinition, getDefaultConnectionData } from '../lib/connectionTypes';

interface CanvasToolProps {
  designId?: string | null;
  onTitleChange?: (title: string) => void;
  refreshCanvas?: number;
}

// Define a type for the design data used in CanvasTool
interface CanvasDesign {
  id?: string;
  name: string;
  description: string;
  thumbnail: string | null;
  objects: CanvasObject[];
  connections: Connection[];
  designGroups?: any[];
  x?: number;
  y?: number;
}

const CanvasTool: React.FC<CanvasToolProps> = ({ designId, onTitleChange, refreshCanvas }) => {
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
    designGroups: [],
    x: 0,
    y: 0,
  });

  // Key for localStorage cache
  const localCacheKey = designId ? `design-cache-${designId}` : 'design-cache-new';

  const [activeName, setActiveName] = useState<string | null>(null);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [activeConnectionIndex, setActiveConnectionIndex] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState('#4ECDC4');
  const [selectedConnectionType, setSelectedConnectionType] = useState<ConnectionType>(ConnectionType.DEFAULT);
  const [isDraggingObject, setIsDraggingObject] = useState(false);
  const [designGroupsExpanded, setDesignGroupsExpanded] = useState(false);
  const [mobilePanelExpanded, setMobilePanelExpanded] = useState(true);
  
  // Track group drag state for real-time visual updates
  const [groupDragState, setGroupDragState] = useState<{
    groupId: string;
    objectNames: string[];
    offsetX: number;
    offsetY: number;
  } | null>(null);

  // Bind Delete key to delete active object, group, or connection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger delete if editing text or group name
      const activeEl = document.activeElement;
      const isEditing = activeEl && (
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        (activeEl as HTMLElement).isContentEditable
      );
      if (isEditing) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (activeName) {
          removeObject(activeName);
        } else if (activeGroupId) {
          removeDesignGroup(activeGroupId);
        } else if (activeConnectionIndex !== null) {
          removeConnection(activeConnectionIndex);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeName, activeGroupId, activeConnectionIndex]);

  // Fetch design data if designId is provided, with localStorage cache restore
  useEffect(() => {
    if (authLoading) return;
    // Try to restore from localCache utility first, but skip if refresh is needed
    if (!refreshCanvas || refreshCanvas === 0) {
      const cached = getDesignCache<CanvasState>(localCacheKey);
      if (cached) {
        dispatch({ type: 'SET_STATE', payload: cached });
        if (onTitleChange) onTitleChange(cached.name);
        return; // Skip fetching from server if cache exists and no refresh is needed
      }
    }
    if (designId && designId !== 'new') {
      setLoading(true);
      setLoadError(null);
      getDesign(designId, session?.access_token)
        .then((result) => {
          if (result.success && result.data) {
            // Use schema transformation utility
            const { objects, connections, designGroups } = transformFromBackendSchema(result.data);
            
            const newDesignData: CanvasDesign = {
              id: result.data.id,
              name: result.data.name || '',
              description: result.data.description || '',
              thumbnail: result.data.thumbnail || null,
              objects,
              connections,
              designGroups,
              x: result.data.data?.x || 0,
              y: result.data.data?.y || 0,
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
  }, [designId, authLoading, session?.access_token, onTitleChange, refreshCanvas]);

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
    const accessToken = session?.access_token;
    
    try {
      // Step 1: First, create or update the design to get an ID (if needed)
      let result;
      let newId = id;
      
      // Transform to new backend schema
      const backendSchema = transformToBackendSchema({
        name: canvasState.name || 'Untitled Design',
        description: canvasState.description || '',
        thumbnail: canvasState.thumbnail, // Will be updated after thumbnail upload
        objects: canvasState.objects,
        connections: canvasState.connections,
        designGroups: canvasState.designGroups,
      });
      
      // Send the flattened backend schema directly (no nested 'data' field)
      const payload = backendSchema;
      
      if (!id || id === 'new') {
        result = await createDesign({ ...payload }, accessToken);
        if (result.success && result.id) {
          newId = result.id;
          // Update the URL to use the new id
          if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('id', result.id);
            window.history.replaceState({}, '', url.toString());
          }
          // Update state with the new ID
          dispatch({ type: 'SET_STATE', payload: { id: newId } });
        }
      } else {
        result = await saveDesign({ ...payload }, id, accessToken);
      }
      
      if (!result.success){
        toast.error(result.error || 'Failed to create/save design');
        setSaving(false);
        return;
      }

      // Step 2: Generate and upload thumbnail if we have a stage ref and design ID
      if (stageRef.current && newId && newId !== 'new') {
        try {
          // Generate thumbnail from Konva stage
          const thumbnailBlob = await generateThumbnailFromStage(stageRef.current, {
            width: 400,
            height: 300,
            quality: 0.8,
          });
          
          // Convert blob to base64
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(thumbnailBlob);
          });
          
          const base64Data = await base64Promise;
          
          // Upload thumbnail to backend
          const uploadResult = await uploadThumbnail(newId, base64Data, accessToken);
          
          if (uploadResult.success && uploadResult.url) {
            // Update local state with new thumbnail URL
            dispatch({ type: 'SET_STATE', payload: { thumbnail: uploadResult.url } });
            toast.success('Design and thumbnail saved successfully!');
          } else {
            // Design saved but thumbnail upload failed - still consider it a success
            toast.success('Design saved! (Thumbnail upload failed)');
            console.error('Thumbnail upload failed:', uploadResult.error);
          }
        } catch (thumbnailError) {
          // Design saved but thumbnail generation failed - still consider it a success
          console.error('Failed to generate/upload thumbnail:', thumbnailError);
          toast.success('Design saved! (Thumbnail generation failed)');
        }
      } else {
        toast.success('Design saved successfully!');
      }
      
      setSaving(false);
      setSaveSuccess(result.success);
      setTimeout(() => setSaveSuccess(false), 1200);
      
      // Clear localStorage cache after successful save
      if (result.success) {
        clearDesignCache(localCacheKey);
      }
    } catch (e) {
      setSaving(false);
      setSaveSuccess(false);
      toast.error('Failed to save design');
      console.error('Save error:', e);
    }
  };
  const [editingTextName, setEditingTextName] = useState<string | null>(null);
  const [textInputPosition, setTextInputPosition] = useState<{ x: number; y: number } | null>(null);
  // Group name editing state
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [groupNameInputPosition, setGroupNameInputPosition] = useState<{ x: number; y: number } | null>(null);
  const groupNameInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingConnection, setIsDraggingConnection] = useState(false);
  const [connectionDragStart, setConnectionDragStart] = useState<{
    objName: string; anchorPosition: string; x: number; y: number;
  } | null>(null);
  const [connectionDragEnd, setConnectionDragEnd] = useState<{ x: number; y: number } | null>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageDimensions, setStageDimensions] = useState({ width: 800, height: 600 });
  
  // Zoom/scale state for pinch and wheel zoom
  const [scale, setScale] = useState(1);
  const SCALE_MIN = 0.25;
  const SCALE_MAX = 3;
  const SCALE_STEP = 0.1;
  
  // Refs for pinch zoom gesture tracking
  const lastCenter = useRef<{ x: number; y: number } | null>(null);
  const lastDist = useRef<number>(0);

  const addObject = (type: AssetType, content: string = '') => {
    const name = Math.random().toString(36).substr(2, 9);
    const baseObj = {
      name,
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
      // Architectural components
      case 'api-gateway':
      case 'microservice':
      case 'database':
      case 'cache':
      case 'message-queue':
      case 'load-balancer':
      case 'storage':
      case 'cdn':
      case 'lambda':
      case 'container':
      case 'kubernetes':
      case 'cloud':
      case 'server':
      case 'user':
      case 'mobile-app':
      case 'web-app':
      case 'firewall':
      case 'monitor':
      case 'text-box':
        const componentDef = ARCHITECTURE_COMPONENTS[type as keyof typeof ARCHITECTURE_COMPONENTS];
        newObj = {
          ...baseObj,
          width: componentDef?.width || 100,
          height: componentDef?.height || 100,
          color: componentDef?.color || selectedColor,
          // For text-box, start with empty content for user to add text
          // For other components, use the component label
          content: type === 'text-box' ? '' : (componentDef?.label || type)
        };
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
    setActiveName(name);
  };

  const updateObject = (name: string, updates: Partial<CanvasObject>) => {
    dispatch({ type: 'UPDATE_OBJECT', name, updates });
  };

  const removeObject = (name: string) => {
    dispatch({ type: 'REMOVE_OBJECT', name });
    setActiveName(null);
  };

  const removeDesignGroup = (id: string) => {
    dispatch({ type: 'REMOVE_DESIGN_GROUP', id });
    setActiveGroupId(null);
  };

  const removeConnection = (index: number) => {
    dispatch({ type: 'REMOVE_CONNECTION', id: String(index) });
    setActiveConnectionIndex(null);
  };

  // Add a new design group to the canvas
  const addDesignGroup = () => {
    const id = `group-${Math.random().toString(36).substr(2, 9)}`;
    const groupIndex = canvasState.designGroups.length;
    const groupColors = ['#607D8B', '#FF9800', '#2196F3', '#4CAF50', '#9C27B0', '#F44336', '#00BCD4', '#795548'];
    const newGroup = {
      id,
      name: `Group ${groupIndex + 1}`,
      displayName: `Group ${groupIndex + 1}`,
      description: '',
      uidata: {
        x: 100 + (groupIndex * 50) % 200,
        y: 100 + (groupIndex * 50) % 150,
        width: 200,
        height: 150,
        borderColor: groupColors[groupIndex % groupColors.length],
        borderThickness: 2,
        borderStyle: 'dashed' as const,
      },
      designs: [],
    };
    dispatch({ type: 'ADD_DESIGN_GROUP', payload: newGroup });
    setActiveGroupId(id);
  };

  const isOverlappedByHigher = useCallback((id: string, self: CanvasObject) => {
    return canvasState.objects.some(other => {
      if (other.name === id) return false;
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
  const getAnchorPosition = (objName: string, position: string) => {
    const obj = canvasState.objects.find(o => o.name === objName);
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
  const handleAnchorDragStart = (objName: string, anchorPosition: string, x: number, y: number) => {
    setIsDraggingConnection(true);
    setConnectionDragStart({ objName, anchorPosition, x, y });
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

  // Helper to find optimal anchor points between two objects for minimal turns
  const findOptimalAnchors = (fromObj: CanvasObject, toObj: CanvasObject): { fromPoint: string; toPoint: string } => {
    // Calculate center points
    const fromCenter = {
      x: fromObj.x + fromObj.width / 2,
      y: fromObj.y + fromObj.height / 2
    };
    const toCenter = {
      x: toObj.x + toObj.width / 2,
      y: toObj.y + toObj.height / 2
    };
    
    const dx = toCenter.x - fromCenter.x;
    const dy = toCenter.y - fromCenter.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    
    // Determine primary direction (horizontal or vertical)
    if (absDx > absDy) {
      // Primarily horizontal layout
      if (dx > 0) {
        // Target is to the right
        return { fromPoint: 'right', toPoint: 'left' };
      } else {
        // Target is to the left
        return { fromPoint: 'left', toPoint: 'right' };
      }
    } else {
      // Primarily vertical layout
      if (dy > 0) {
        // Target is below
        return { fromPoint: 'bottom', toPoint: 'top' };
      } else {
        // Target is above
        return { fromPoint: 'top', toPoint: 'bottom' };
      }
    }
  };

  // Helper to update all connections involving an object with optimal anchor points
  const updateConnectionAnchors = (objName: string) => {
    const obj = canvasState.objects.find(o => o.name === objName);
    if (!obj) return;

    // Find all connections involving this object
    const connectionsToUpdate = canvasState.connections.filter(
      conn => conn.from === objName || conn.to === objName
    );

    connectionsToUpdate.forEach(conn => {
      const fromObj = canvasState.objects.find(o => o.name === conn.from);
      const toObj = canvasState.objects.find(o => o.name === conn.to);
      
      if (fromObj && toObj) {
        const optimalAnchors = findOptimalAnchors(fromObj, toObj);
        
        // Update the connection with optimal anchor points
        dispatch({
          type: 'UPDATE_CONNECTION',
          name: conn.name,
          updates: {
            fromPoint: optimalAnchors.fromPoint,
            toPoint: optimalAnchors.toPoint
          }
        });
      }
    });
  };

  // Handler for ending a connection drag
  const handleAnchorDragEnd = (x: number, y: number) => {
    if (!isDraggingConnection || !connectionDragStart) return;

    const targetObj = canvasState.objects.find(obj => {
      if (obj.name === connectionDragStart.objName) return false;
      return (
        x >= obj.x &&
        x <= obj.x + obj.width &&
        y >= obj.y &&
        y <= obj.y + obj.height
      );
    });

    if (targetObj) {
      // Create connection between existing objects
      const sourceObj = canvasState.objects.find(o => o.name === connectionDragStart.objName);
      if (!sourceObj) return;
      
      // Use optimal anchors for minimal turns
      const optimalAnchors = findOptimalAnchors(sourceObj, targetObj);
      
      const typeDef = getConnectionTypeDefinition(selectedConnectionType);
      const defaultStyle = typeDef?.defaultStyle;
      const defaultData = getDefaultConnectionData(selectedConnectionType);
      
      dispatch({
        type: 'ADD_CONNECTION',
        payload: {
          name: `${connectionDragStart.objName} → ${targetObj.name}`,
          connectionType: selectedConnectionType,
          connectionData: defaultData,
          from: connectionDragStart.objName,
          to: targetObj.name,
          fromPoint: optimalAnchors.fromPoint,
          toPoint: optimalAnchors.toPoint,
          uidata: {
            borderColor: defaultStyle?.borderColor || '#3B82F6',
            borderThickness: defaultStyle?.borderThickness || 2,
            borderStyle: defaultStyle?.borderStyle || 'solid',
            arrowType: defaultStyle?.arrowType,
            linePattern: defaultStyle?.linePattern,
          },
        }
      });
      setActiveName(targetObj.name);
    } else {
      // No target found - duplicate the source object at cursor position
      const sourceObj = canvasState.objects.find(o => o.name === connectionDragStart.objName);
      if (sourceObj) {
        const newName = sourceObj.name + '-' + Math.random().toString(36).substr(2, 5);
        const newObj: CanvasObject = {
          ...sourceObj,
          name: newName,
          x: x - sourceObj.width / 2,
          y: y - sourceObj.height / 2,
          zIndex: canvasState.objects.length + 1,
        };
        
        // Use optimal anchors for minimal turns
        const optimalAnchors = findOptimalAnchors(sourceObj, newObj);
        
        const typeDef = getConnectionTypeDefinition(selectedConnectionType);
        const defaultStyle = typeDef?.defaultStyle;
        const defaultData = getDefaultConnectionData(selectedConnectionType);
        
        dispatch({ type: 'ADD_OBJECT', payload: newObj });
        dispatch({
          type: 'ADD_CONNECTION',
          payload: {
            name: `${connectionDragStart.objName} → ${newName}`,
            connectionType: selectedConnectionType,
            connectionData: defaultData,
            from: connectionDragStart.objName,
            to: newName,
            fromPoint: optimalAnchors.fromPoint,
            toPoint: optimalAnchors.toPoint,
            uidata: {
              borderColor: defaultStyle?.borderColor || '#3B82F6',
              borderThickness: defaultStyle?.borderThickness || 2,
              borderStyle: defaultStyle?.borderStyle || 'solid',
              arrowType: defaultStyle?.arrowType,
              linePattern: defaultStyle?.linePattern,
            },
          }
        });
        setActiveName(newName);
      }
    }

    setIsDraggingConnection(false);
    setConnectionDragStart(null);
    setConnectionDragEnd(null);
    setResetInteraction((v) => v + 1);
  };

  // Handler for when a design group drag starts
  const handleGroupDragStart = (groupId: string, objectNames: string[]) => {
    setActiveGroupId(groupId);
    setActiveName(null); // Deselect any selected object
    setActiveConnectionIndex(null); // Deselect any selected connection
    setGroupDragState({
      groupId,
      objectNames,
      offsetX: 0,
      offsetY: 0,
    });
  };

  // Handler for when a design group is being dragged (real-time)
  const handleGroupDragMove = (groupId: string, deltaX: number, deltaY: number) => {
    setGroupDragState(prev => {
      if (!prev || prev.groupId !== groupId) return prev;
      return {
        ...prev,
        offsetX: deltaX,
        offsetY: deltaY,
      };
    });
  };

  // Handler for when a design group drag ends
  const handleGroupDragEnd = (groupId: string, deltaX: number, deltaY: number, objectNames: string[]) => {
    // Clear the visual drag state first
    setGroupDragState(null);
    
    if (deltaX === 0 && deltaY === 0) return; // No movement, skip
    
    dispatch({
      type: 'DRAG_DESIGN_GROUP',
      id: groupId,
      deltaX,
      deltaY,
      objectNames,
    });
  };

  // Handler for when a design group is resized
  const handleGroupResize = (groupId: string, newWidth: number, newHeight: number) => {
    const group = canvasState.designGroups.find(g => g.id === groupId);
    if (!group) return;
    
    dispatch({
      type: 'UPDATE_DESIGN_GROUP',
      id: groupId,
      updates: {
        uidata: {
          ...group.uidata,
          width: newWidth,
          height: newHeight,
        },
      },
    });
  };

// Update stage dimensions on container resize
  React.useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const height = containerRef.current.offsetHeight;
        // Guard against 0 dimensions which cause Konva drawImage errors
        if (width > 0 && height > 0) {
          setStageDimensions({ width, height });
        }
      }
    };
    
    // Delay to allow DOM layout to settle after panel toggle (wait for CSS transition)
    const timeoutId = setTimeout(updateDimensions, 350);
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => {
      window.removeEventListener('resize', updateDimensions);
      clearTimeout(timeoutId);
    };
  }, [mobilePanelExpanded]);

  // Get distance between two touch points
  const getDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  // Get center point between two touch points
  const getCenter = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
  };

  // Handle wheel zoom (for desktop)
  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const oldScale = scale;
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    // Zoom in or out based on wheel direction
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = Math.max(SCALE_MIN, Math.min(SCALE_MAX, oldScale + direction * SCALE_STEP));

    setScale(newScale);

    // Adjust position to zoom towards pointer
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    dispatch({ type: 'UPDATE_STAGE', payload: newPos });
  };

  // Handle pinch zoom touch start
  const handlePinchTouchStart = (e: any) => {
    const touch1 = e.evt.touches[0];
    const touch2 = e.evt.touches[1];

    if (touch1 && touch2) {
      // Two fingers detected - start pinch tracking
      const p1 = { x: touch1.clientX, y: touch1.clientY };
      const p2 = { x: touch2.clientX, y: touch2.clientY };
      lastCenter.current = getCenter(p1, p2);
      lastDist.current = getDistance(p1, p2);
    }
  };

  // Handle pinch zoom touch move
  const handlePinchTouchMove = (e: any) => {
    const touch1 = e.evt.touches[0];
    const touch2 = e.evt.touches[1];

    if (touch1 && touch2 && lastCenter.current && lastDist.current > 0) {
      e.evt.preventDefault();
      const stage = stageRef.current;
      if (!stage) return;

      const p1 = { x: touch1.clientX, y: touch1.clientY };
      const p2 = { x: touch2.clientX, y: touch2.clientY };
      const newCenter = getCenter(p1, p2);
      const newDist = getDistance(p1, p2);

      // Calculate scale change
      const scaleFactor = newDist / lastDist.current;
      const oldScale = scale;
      const newScale = Math.max(SCALE_MIN, Math.min(SCALE_MAX, oldScale * scaleFactor));

      // Get the stage container position
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Calculate the point to zoom towards (center of pinch relative to stage)
      const pointTo = {
        x: (newCenter.x - rect.left - stage.x()) / oldScale,
        y: (newCenter.y - rect.top - stage.y()) / oldScale,
      };

      // Calculate pan offset
      const dx = newCenter.x - lastCenter.current.x;
      const dy = newCenter.y - lastCenter.current.y;

      // Update position to zoom towards center and apply pan
      const newPos = {
        x: newCenter.x - rect.left - pointTo.x * newScale + dx,
        y: newCenter.y - rect.top - pointTo.y * newScale + dy,
      };

      setScale(newScale);
      dispatch({ type: 'UPDATE_STAGE', payload: newPos });

      // Update tracking values
      lastCenter.current = newCenter;
      lastDist.current = newDist;
    }
  };

  // Handle pinch zoom touch end
  const handlePinchTouchEnd = () => {
    lastCenter.current = null;
    lastDist.current = 0;
  };

  // Zoom control functions
  const zoomIn = () => {
    const newScale = Math.min(SCALE_MAX, scale + SCALE_STEP * 2);
    setScale(newScale);
  };

  const zoomOut = () => {
    const newScale = Math.max(SCALE_MIN, scale - SCALE_STEP * 2);
    setScale(newScale);
  };

  const resetZoom = () => {
    setScale(1);
    dispatch({ type: 'UPDATE_STAGE', payload: { x: 0, y: 0 } });
  };

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
      {/* Left Panel: Architecture Components */}
      <aside className={`w-full md:w-1/5 md:min-w-[300px] ${mobilePanelExpanded ? 'h-[40%]' : 'h-auto'} md:h-full bg-gray-50 dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col transition-all duration-300`}>
        {/* Mobile Toggle Header */}
        <button
          onClick={() => setMobilePanelExpanded(!mobilePanelExpanded)}
          className="md:hidden flex items-center justify-between w-full p-3 border-b border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-700"
        >
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">TOOL PANEL</span>
          {mobilePanelExpanded ? <ChevronUp size={18} className="text-gray-500 dark:text-gray-400" /> : <ChevronDown size={18} className="text-gray-500 dark:text-gray-400" />}
        </button>
        
        {/* Collapsible Content */}
        <div className={`${mobilePanelExpanded ? 'flex' : 'hidden'} md:flex flex-col gap-6 p-6 overflow-y-auto custom-scrollbar flex-1`}>
        {/* DESIGN GROUPS Section */}
        <div>
          <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
            <Layers size={14} /> DESIGN GROUPS
          </h4>
          <div className="space-y-2">
            <button 
              onClick={addDesignGroup}
              className="w-full flex items-center justify-center gap-2 p-3 bg-white dark:bg-slate-700 border-2 border-dashed border-gray-300 dark:border-slate-500 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-400 dark:hover:border-green-500 transition-all text-gray-700 dark:text-gray-200"
            >
              <Plus size={16} className="text-green-500" />
              <span className="text-xs font-semibold">Add Design Group</span>
            </button>
            {canvasState.designGroups.length > 0 && (
              <div className="mt-2 p-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600">
                <button
                  onClick={() => setDesignGroupsExpanded(!designGroupsExpanded)}
                  className="w-full flex items-center justify-between text-[9px] text-gray-500 dark:text-gray-400 mb-0 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  <span>
                    Existing {canvasState.designGroups.length} group{canvasState.designGroups.length !== 1 ? 's' : ''} on canvas
                  </span>
                  {designGroupsExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
                {designGroupsExpanded && (
                  <div className="space-y-1 max-h-32 overflow-y-auto mt-2">
                    {canvasState.designGroups.map((group) => (
                      <div 
                        key={group.id}
                        onClick={() => setActiveGroupId(group.id)}
                        className={`flex items-center gap-2 p-1.5 rounded cursor-pointer transition-all ${
                          activeGroupId === group.id 
                            ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700' 
                            : 'hover:bg-gray-100 dark:hover:bg-slate-600'
                        }`}
                      >
                        <div 
                          className="w-3 h-3 rounded-sm border-2" 
                          style={{ 
                            borderColor: group.uidata?.borderColor || '#4CAF50',
                            borderStyle: 'dashed'
                          }} 
                        />
                        <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300 truncate">
                          {group.displayName || group.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        
        <div>
          <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
            <Server size={14} /> ARCHITECTURE ITEMS
          </h4>
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => addObject('api-gateway')}
              className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-400 transition-all text-gray-900 dark:text-gray-100 relative group"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 mb-1" fill="none" stroke={ARCHITECTURE_COMPONENTS['api-gateway'].color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={ARCHITECTURE_COMPONENTS['api-gateway'].iconPath} />
              </svg>
              <span className="text-[8px] font-semibold text-center leading-tight">API GATEWAY</span>
            </button>
            <button 
              onClick={() => addObject('microservice')}
              className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:border-teal-400 transition-all text-gray-900 dark:text-gray-100"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 mb-1" fill="none" stroke={ARCHITECTURE_COMPONENTS['microservice'].color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={ARCHITECTURE_COMPONENTS['microservice'].iconPath} />
              </svg>
              <span className="text-[8px] font-semibold text-center leading-tight">SERVICE</span>
            </button>
            <button 
              onClick={() => addObject('database')}
              className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400 transition-all text-gray-900 dark:text-gray-100"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 mb-1" fill="none" stroke={ARCHITECTURE_COMPONENTS['database'].color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={ARCHITECTURE_COMPONENTS['database'].iconPath} />
              </svg>
              <span className="text-[8px] font-semibold text-center leading-tight">DATABASE</span>
            </button>
            <button 
              onClick={() => addObject('cache')}
              className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:border-yellow-400 transition-all text-gray-900 dark:text-gray-100"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 mb-1" fill="none" stroke={ARCHITECTURE_COMPONENTS['cache'].color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={ARCHITECTURE_COMPONENTS['cache'].iconPath} />
              </svg>
              <span className="text-[8px] font-semibold text-center leading-tight">CACHE</span>
            </button>
            <button 
              onClick={() => addObject('message-queue')}
              className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-400 transition-all text-gray-900 dark:text-gray-100"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 mb-1" fill="none" stroke={ARCHITECTURE_COMPONENTS['message-queue'].color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={ARCHITECTURE_COMPONENTS['message-queue'].iconPath} />
              </svg>
              <span className="text-[8px] font-semibold text-center leading-tight">QUEUE</span>
            </button>
            <button 
              onClick={() => addObject('load-balancer')}
              className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-400 transition-all text-gray-900 dark:text-gray-100"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 mb-1" fill="none" stroke={ARCHITECTURE_COMPONENTS['load-balancer'].color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={ARCHITECTURE_COMPONENTS['load-balancer'].iconPath} />
              </svg>
              <span className="text-[8px] font-semibold text-center leading-tight">LB</span>
            </button>
            <button 
              onClick={() => addObject('storage')}
              className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:border-pink-400 transition-all text-gray-900 dark:text-gray-100"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 mb-1" fill="none" stroke={ARCHITECTURE_COMPONENTS['storage'].color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={ARCHITECTURE_COMPONENTS['storage'].iconPath} />
              </svg>
              <span className="text-[8px] font-semibold text-center leading-tight">STORAGE</span>
            </button>
            <button 
              onClick={() => addObject('cdn')}
              className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-400 transition-all text-gray-900 dark:text-gray-100"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 mb-1" fill="none" stroke={ARCHITECTURE_COMPONENTS['cdn'].color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={ARCHITECTURE_COMPONENTS['cdn'].iconPath} />
              </svg>
              <span className="text-[8px] font-semibold text-center leading-tight">CDN</span>
            </button>
            <button 
              onClick={() => addObject('lambda')}
              className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-400 transition-all text-gray-900 dark:text-gray-100"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 mb-1" fill="none" stroke={ARCHITECTURE_COMPONENTS['lambda'].color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={ARCHITECTURE_COMPONENTS['lambda'].iconPath} />
              </svg>
              <span className="text-[8px] font-semibold text-center leading-tight">LAMBDA</span>
            </button>
            <button 
              onClick={() => addObject('container')}
              className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400 transition-all text-gray-900 dark:text-gray-100"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 mb-1" fill="none" stroke={ARCHITECTURE_COMPONENTS['container'].color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={ARCHITECTURE_COMPONENTS['container'].iconPath} />
              </svg>
              <span className="text-[8px] font-semibold text-center leading-tight">CONTAINER</span>
            </button>
            <button 
              onClick={() => addObject('kubernetes')}
              className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400 transition-all text-gray-900 dark:text-gray-100"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 mb-1" fill="none" stroke={ARCHITECTURE_COMPONENTS['kubernetes'].color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={ARCHITECTURE_COMPONENTS['kubernetes'].iconPath} />
              </svg>
              <span className="text-[8px] font-semibold text-center leading-tight">K8S</span>
            </button>
            <button 
              onClick={() => addObject('cloud')}
              className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:border-teal-400 transition-all text-gray-900 dark:text-gray-100"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 mb-1" fill="none" stroke={ARCHITECTURE_COMPONENTS['cloud'].color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={ARCHITECTURE_COMPONENTS['cloud'].iconPath} />
              </svg>
              <span className="text-[8px] font-semibold text-center leading-tight">CLOUD</span>
            </button>
            <button 
              onClick={() => addObject('server')}
              className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all text-gray-900 dark:text-gray-100"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 mb-1" fill="none" stroke={ARCHITECTURE_COMPONENTS['server'].color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={ARCHITECTURE_COMPONENTS['server'].iconPath} />
              </svg>
              <span className="text-[8px] font-semibold text-center leading-tight">SERVER</span>
            </button>
            <button 
              onClick={() => addObject('user')}
              className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all text-gray-900 dark:text-gray-100"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 mb-1" fill="none" stroke={ARCHITECTURE_COMPONENTS['user'].color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={ARCHITECTURE_COMPONENTS['user'].iconPath} />
              </svg>
              <span className="text-[8px] font-semibold text-center leading-tight">USER</span>
            </button>
            <button 
              onClick={() => addObject('mobile-app')}
              className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:border-teal-400 transition-all text-gray-900 dark:text-gray-100"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 mb-1" fill="none" stroke={ARCHITECTURE_COMPONENTS['mobile-app'].color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={ARCHITECTURE_COMPONENTS['mobile-app'].iconPath} />
              </svg>
              <span className="text-[8px] font-semibold text-center leading-tight">MOBILE</span>
            </button>
            <button 
              onClick={() => addObject('web-app')}
              className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400 transition-all text-gray-900 dark:text-gray-100"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 mb-1" fill="none" stroke={ARCHITECTURE_COMPONENTS['web-app'].color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={ARCHITECTURE_COMPONENTS['web-app'].iconPath} />
              </svg>
              <span className="text-[8px] font-semibold text-center leading-tight">WEB APP</span>
            </button>
            <button 
              onClick={() => addObject('firewall')}
              className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-400 transition-all text-gray-900 dark:text-gray-100"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 mb-1" fill="none" stroke={ARCHITECTURE_COMPONENTS['firewall'].color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={ARCHITECTURE_COMPONENTS['firewall'].iconPath} />
              </svg>
              <span className="text-[8px] font-semibold text-center leading-tight">FIREWALL</span>
            </button>
            <button 
              onClick={() => addObject('monitor')}
              className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-400 transition-all text-gray-900 dark:text-gray-100"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 mb-1" fill="none" stroke={ARCHITECTURE_COMPONENTS['monitor'].color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={ARCHITECTURE_COMPONENTS['monitor'].iconPath} />
              </svg>
              <span className="text-[8px] font-semibold text-center leading-tight">MONITOR</span>
            </button>
            <button 
              onClick={() => addObject('text-box')}
              className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/20 hover:border-gray-400 transition-all text-gray-900 dark:text-gray-100"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 mb-1" fill="none" stroke={ARCHITECTURE_COMPONENTS['text-box'].color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={ARCHITECTURE_COMPONENTS['text-box'].iconPath} />
              </svg>
              <span className="text-[8px] font-semibold text-center leading-tight">TEXT</span>
            </button>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
            <Network size={14} /> CONNECTION TYPES
          </h4>
          <div className="space-y-2">
            {Object.entries(getConnectionTypesByCategory()).map(([category, types]) => (
              <div key={category} className="space-y-1">
                <div className="text-[9px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-1">
                  {category}
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {types.map((typeDef) => (
                    <button
                      key={typeDef.type}
                      onClick={() => setSelectedConnectionType(typeDef.type)}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded border transition-all ${
                        selectedConnectionType === typeDef.type
                          ? 'bg-blue-100 dark:bg-blue-900/40 border-blue-500 dark:border-blue-600 text-blue-700 dark:text-blue-400'
                          : 'bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300'
                      }`}
                      title={typeDef.description}
                    >
                      <span 
                        className="text-base font-mono"
                        style={{ color: typeDef.defaultStyle.borderColor }}
                      >
                        {typeDef.icon}
                      </span>
                      <span className="text-[7px] font-semibold text-center leading-tight truncate w-full">
                        {typeDef.label.toUpperCase()}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
            <p className="text-[8px] text-gray-600 dark:text-gray-400 leading-tight">
              <span className="font-semibold text-blue-600 dark:text-blue-400">{getConnectionTypeDefinition(selectedConnectionType)?.label || 'Default'}</span>
              {' - '}
              {getConnectionTypeDefinition(selectedConnectionType)?.description}
            </p>
          </div>
          {/* <div className="mt-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border-2 border-green-300 dark:border-green-700">
            <div className="flex items-start gap-2 mb-2">
              <span className="text-lg">👆</span>
              <div>
                <p className="text-[10px] font-bold text-green-800 dark:text-green-300 mb-1">HOW TO CREATE CONNECTIONS:</p>
                <ol className="text-[9px] text-gray-700 dark:text-gray-300 leading-relaxed list-decimal list-inside space-y-1">
                  <li><strong>Select</strong> a connection type above</li>
                  <li><strong>Click</strong> any object on canvas to select it</li>
                  <li><strong>Blue circles</strong> will appear at edges</li>
                  <li><strong>Click & drag</strong> from a blue circle</li>
                  <li><strong>Drop</strong> on another object or empty space</li>
                </ol>
              </div>
            </div>
          </div> */}
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
                  if (activeName) {
                    const activeObj = canvasState.objects.find(obj => obj.name === activeName);
                    if (activeObj) {
                      if (activeObj.type === 'text') {
                        updateObject(activeName, { backgroundColor: color });
                      } else if (activeObj.type === 'svg') {
                        updateObject(activeName, { color });
                      }
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

        {/* <div className="pt-6 border-t border-gray-200 dark:border-slate-700">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-700 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🔗</span>
              <h4 className="text-xs font-bold text-blue-700 dark:text-blue-300">
                Creating Connections
              </h4>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] text-gray-700 dark:text-gray-300 leading-relaxed">
                <strong className="text-blue-600 dark:text-blue-400">Step 1:</strong> Select any object on the canvas
              </p>
              <p className="text-[10px] text-gray-700 dark:text-gray-300 leading-relaxed">
                <strong className="text-blue-600 dark:text-blue-400">Step 2:</strong> Blue circles appear at the object's edges
              </p>
              <p className="text-[10px] text-gray-700 dark:text-gray-300 leading-relaxed">
                <strong className="text-blue-600 dark:text-blue-400">Step 3:</strong> Click & drag from a blue circle to another object
              </p>
              <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-800">
                <p className="text-[9px] text-gray-600 dark:text-gray-400 italic">
                  💡 Tip: Choose a connection type from the panel above before creating the connection!
                </p>
              </div>
            </div>
          </div>
        </div> */}

        <div className="pt-6 border-t border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
             <span className="text-xs text-gray-400 dark:text-gray-500">Everything below is for development purpose</span>
             <Layers size={14} className="text-gray-400 dark:text-gray-500" />
          </div>
        </div>

        <div className="order-t border-gray-200 dark:border-slate-700">
          <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3">
            DEBUG PANEL
          </h4>
          <pre className="text-[9px] bg-gray-900 dark:bg-black text-green-400 p-3 rounded-lg overflow-auto max-h-48 font-mono">
          {(() => {
            const activeObj = canvasState.objects.find(obj => obj.name === activeName);
            const canvasDebug = {
              objectCount: canvasState.objects.length,
              x: Math.round(canvasState.x),
              y: Math.round(canvasState.y)
            };
            if (!activeObj) {
              return JSON.stringify({
                canvas: canvasDebug,
                activeObject: null,
                message: "No object selected"
              }, null, 2);
            }
            const debugInfo: any = {
              canvas: canvasDebug,
              type: activeObj.type,
              name: activeObj.name,
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
                
                // Support both new schema (items) and old schema (objects)
                if (obj.items && Array.isArray(obj.items)) {
                  // New schema format - transform it
                  const { objects, connections, designGroups } = transformFromBackendSchema(obj);
                  dispatch({ type: 'SET_STATE', payload: { objects, connections, designGroups } });
                  setPatchError('');
                } else if (obj.objects && Array.isArray(obj.objects) && obj.connections && Array.isArray(obj.connections)) {
                  // Old schema format
                  const designGroups = obj.designGroups || [];
                  dispatch({ type: 'SET_STATE', payload: { objects: obj.objects, connections: obj.connections, designGroups } });
                  setPatchError('');
                } else {
                  setPatchError('JSON must have "items" (new schema) or "objects" and "connections" (old schema) arrays.');
                }
              } catch (e: any) {
                setPatchError('Invalid JSON: ' + (e.message || e));
              }
            }}
          >Apply</button>
        </div>
        </div>
      </aside>

      {/* Right: Canvas (80%) */}
      <section 
        ref={containerRef}
        className="w-full md:w-4/5 flex-1 md:h-full relative bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#475569_1px,transparent_1px)] [background-size:20px_20px] overflow-hidden"
      >
        <div className="absolute top-4 right-4 flex gap-2 z-[1001]">
           {(activeName || activeGroupId || activeConnectionIndex !== null) && (
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if (activeName) {
                    removeObject(activeName);
                  } else if (activeGroupId) {
                    removeDesignGroup(activeGroupId);
                  } else if (activeConnectionIndex !== null) {
                    removeConnection(activeConnectionIndex);
                  }
                }}
                className="p-2 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-full hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors shadow-lg"
              >
                <Trash2 size={20} />
              </button>
           )}
        </div>
        
        {/* Zoom controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-1 z-[1001]">
          <button
            onClick={zoomIn}
            className="p-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-lg border border-gray-200 dark:border-gray-600"
            title="Zoom In"
          >
            <ZoomIn size={18} />
          </button>
          <button
            onClick={zoomOut}
            className="p-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-lg border border-gray-200 dark:border-gray-600"
            title="Zoom Out"
          >
            <ZoomOut size={18} />
          </button>
          <button
            onClick={resetZoom}
            className="p-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-lg border border-gray-200 dark:border-gray-600"
            title="Reset Zoom"
          >
            <RotateCcw size={18} />
          </button>
          <div className="text-xs text-center text-gray-500 dark:text-gray-400 mt-1 font-mono">
            {Math.round(scale * 100)}%
          </div>
        </div>

        <Stage
          ref={stageRef}
          width={stageDimensions.width || 1}
          height={stageDimensions.height || 1}
          draggable={true}
          x={canvasState.x}
          y={canvasState.y}
          scaleX={scale}
          scaleY={scale}
          onWheel={handleWheel}
          onDragEnd={(e) => {
            // Only update canvas position if not dragging an object
            if (!isDraggingObject) {
              dispatch({
                type: 'UPDATE_STAGE',
                payload: { x: e.target.x(), y: e.target.y() },
              });
            }
          }}
          onMouseDown={(e) => {
            // Don't deselect if dragging connection
            if (isDraggingConnection) return;
            
            // Deselect when clicking on empty canvas
            const clickedOnEmpty = e.target === e.target.getStage();
            if (clickedOnEmpty) {
              setActiveName(null);
              setActiveGroupId(null);
              setActiveConnectionIndex(null);
              setEditingTextName(null);
              setTextInputPosition(null);
            }
          }}
          onMouseMove={(e) => {
            if (isDraggingConnection) {
              const stage = e.target.getStage();
              const pos = stage?.getPointerPosition();
              if (pos && stage) {
                handleConnectionDrag((pos.x - stage.x()) / scale, (pos.y - stage.y()) / scale);
              }
            }
          }}
          onMouseUp={(e) => {
            if (isDraggingConnection) {
              const stage = e.target.getStage();
              const pos = stage?.getPointerPosition();
              if (pos && stage) {
                handleAnchorDragEnd((pos.x - stage.x()) / scale, (pos.y - stage.y()) / scale);
              }
            }
          }}
          onTouchStart={(e) => {
            // Handle pinch zoom with 2 fingers
            if (e.evt.touches.length === 2) {
              handlePinchTouchStart(e);
              return;
            }
            
            // Don't deselect if dragging connection
            if (isDraggingConnection) return;
            
            const clickedOnEmpty = e.target === e.target.getStage();
            if (clickedOnEmpty) {
              setActiveName(null);
              setActiveConnectionIndex(null);
              setEditingTextName(null);
              setTextInputPosition(null);
            }
          }}
          onTouchMove={(e) => {
            // Handle pinch zoom with 2 fingers
            if (e.evt.touches.length === 2) {
              handlePinchTouchMove(e);
              return;
            }
            
            if (isDraggingConnection) {
              const stage = e.target.getStage();
              const pos = stage?.getPointerPosition();
              if (pos && stage) {
                handleConnectionDrag((pos.x - stage.x()) / scale, (pos.y - stage.y()) / scale);
              }
            }
          }}
          onTouchEnd={(e) => {
            // Reset pinch tracking
            handlePinchTouchEnd();
            
            if (isDraggingConnection) {
              const stage = e.target.getStage();
              const pos = stage?.getPointerPosition();
              if (pos && stage) {
                handleAnchorDragEnd((pos.x - stage.x()) / scale, (pos.y - stage.y()) / scale);
              }
            }
          }}
        >
          <Layer>
            {/* Render design groups (behind everything) */}
            <DesignGroupRenderer
              designGroups={canvasState.designGroups || []}
              objects={canvasState.objects}
              onSelect={(groupId) => {
                setActiveGroupId(groupId);
                setActiveName(null);
                setActiveConnectionIndex(null);
              }}
              activeGroupId={activeGroupId}
              onGroupDragStart={handleGroupDragStart}
              onGroupDragMove={handleGroupDragMove}
              onGroupDragEnd={handleGroupDragEnd}
              onGroupResize={handleGroupResize}
              onStartGroupNameEdit={(groupId, position) => {
                setEditingGroupId(groupId);
                setGroupNameInputPosition(position);
                setTimeout(() => {
                  if (groupNameInputRef.current) {
                    groupNameInputRef.current.focus();
                    groupNameInputRef.current.select();
                  }
                }, 0);
              }}
            />
            
            {/* Render connection lines between objects using new ConnectionRenderer */}
            <ConnectionRenderer
              connections={canvasState.connections}
              objects={canvasState.objects}
              groupDragState={groupDragState}
              activeConnectionIndex={activeConnectionIndex}
              onConnectionClick={(index) => {
                setActiveConnectionIndex(index);
                setActiveName(null);
                setActiveGroupId(null);
              }}
            />
            
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
            {canvasState.objects.map((obj) => {
              // Calculate group drag offset for this object if it's being dragged as part of a group
              const objGroupDragOffset = groupDragState && groupDragState.objectNames.includes(obj.name)
                ? { x: groupDragState.offsetX, y: groupDragState.offsetY }
                : null;
              
              return (
              <DraggableObject 
                key={obj.name} 
                obj={obj} 
                active={activeName === obj.name}
                isGrayedOut={isOverlappedByHigher(obj.name, obj)}
                onSelect={() => {
                  // Close any open text editing when selecting a different object
                  if (activeName !== obj.name) {
                    setEditingTextName(null);
                    setTextInputPosition(null);
                  }
                  setActiveName(obj.name);
                  setActiveGroupId(null);
                  setActiveConnectionIndex(null);
                }}
                onUpdate={(updates) => updateObject(obj.name, updates)}
                onStartTextEdit={(position) => {
                  setEditingTextName(obj.name);
                  setTextInputPosition(position);
                  setTimeout(() => {
                    if (textInputRef.current) {
                      textInputRef.current.focus();
                      textInputRef.current.select();
                    }
                  }, 0);
                }}
                onAnchorDragStart={(anchorPosition, x, y) => {
                  handleAnchorDragStart(obj.name, anchorPosition, x, y);
                }}
                onDragStartObject={() => { 
                  setIsDraggingObject(true);
                  console.log('Started dragging object', obj.name);
                }}
                onDragEndObject={() => { 
                  setIsDraggingObject(false);
                  console.log('Ended dragging object', obj.name);
                  // Update connection anchor points for optimal routing
                  updateConnectionAnchors(obj.name);
                }}
                resetInteraction={resetInteraction}
                groupDragOffset={objGroupDragOffset}
              />
            );
            })}
          </Layer>
        </Stage>

        {/* Text editing overlay - completely outside Konva */}
        {editingTextName && textInputPosition && typeof document !== 'undefined' && (() => {
          const editingObj = canvasState.objects.find(o => o.name === editingTextName);
          // Allow editing for text, text-box, and all architectural component types
          const architecturalTypes = [
            'api-gateway', 'microservice', 'database', 'cache', 'message-queue', 
            'load-balancer', 'storage', 'cdn', 'lambda', 'container', 'kubernetes', 
            'cloud', 'server', 'user', 'mobile-app', 'web-app', 'firewall', 'monitor'
          ];
          const isEditableType = editingObj && (
            editingObj.type === 'text' || 
            editingObj.type === 'text-box' || 
            architecturalTypes.includes(editingObj.type)
          );
          if (!editingObj || !isEditableType) return null;
          
          // Determine the current display text - use content if available, otherwise displayName or name
          const currentText = editingObj.content || editingObj.displayName || editingObj.name || '';
          
          return (
            <textarea
              ref={textInputRef}
              value={currentText}
              onChange={(e) => {
                // Update both content and displayName when editing
                updateObject(editingTextName!, { 
                  content: e.target.value,
                  displayName: e.target.value
                });
              }}
              onBlur={() => {
                setEditingTextName(null);
                setTextInputPosition(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setEditingTextName(null);
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
                color: '#1f2937',
                backgroundColor: '#f9fafb',
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

        {/* Group name editing overlay */}
        {editingGroupId && groupNameInputPosition && typeof document !== 'undefined' && (() => {
          const editingGroup = canvasState.designGroups.find(g => g.id === editingGroupId);
          if (!editingGroup) return null;
          
          // Use displayName if available, otherwise fall back to name
          const currentDisplayName = editingGroup.displayName || editingGroup.name || '';
          
          return (
            <input
              ref={groupNameInputRef}
              type="text"
              value={currentDisplayName}
              onChange={(e) => {
                // Update the group's displayName
                dispatch({
                  type: 'UPDATE_DESIGN_GROUP',
                  id: editingGroupId!,
                  updates: { displayName: e.target.value }
                });
              }}
              onBlur={() => {
                setEditingGroupId(null);
                setGroupNameInputPosition(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Escape') {
                  setEditingGroupId(null);
                  setGroupNameInputPosition(null);
                }
              }}
              style={{
                position: 'fixed',
                left: `${groupNameInputPosition.x}px`,
                top: `${groupNameInputPosition.y}px`,
                minWidth: '120px',
                height: '20px',
                fontSize: '12px',
                fontWeight: 'bold',
                color: 'white',
                backgroundColor: editingGroup.uidata?.borderColor || '#4CAF50',
                padding: '0 8px',
                border: '2px solid #3B82F6',
                borderRadius: '4px',
                outline: 'none',
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
