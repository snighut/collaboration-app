import React, { useState, useEffect, useRef } from 'react';
import { Rect, Text as KonvaText, Image as KonvaImage, Path, Group, Line, Arrow, Circle as KonvaCircle, RegularPolygon } from 'react-konva';
import { CanvasObject } from '../types';
import { ARCHITECTURE_COMPONENTS } from '../constants';
// @ts-ignore
import useImage from 'use-image';

interface DraggableObjectProps {
  obj: CanvasObject;
  active: boolean;
  isGrayedOut: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<CanvasObject>) => void;
  onStartTextEdit?: (position: { x: number; y: number }) => void;
  onAnchorDragStart?: (anchorPosition: string, x: number, y: number) => void;
  resetInteraction?: number;
  onDragStartObject?: () => void;
  onDragEndObject?: () => void;
  groupDragOffset?: { x: number; y: number } | null;
}

// Component to handle image loading
const ImageShape: React.FC<{ obj: CanvasObject; active: boolean; isGrayedOut: boolean }> = ({ obj, active, isGrayedOut }) => {
  const [image] = useImage(obj.content, 'anonymous');
  
  return (
    <>
      <KonvaImage
        image={image}
        x={0}
        y={0}
        width={obj.width}
        height={obj.height}
        cornerRadius={8}
        opacity={isGrayedOut && !active ? 0.4 : 1}
      />
      {active && (
        <Rect
          x={0}
          y={0}
          width={obj.width}
          height={obj.height}
          stroke="#3B82F6"
          strokeWidth={2}
          cornerRadius={8}
        />
      )}
    </>
  );
};

const DraggableObject: React.FC<DraggableObjectProps> = ({
  obj, active, isGrayedOut, onSelect, onUpdate, onStartTextEdit, onAnchorDragStart, resetInteraction, onDragStartObject, onDragEndObject, groupDragOffset
}) => {
  // Cancel hold timer and set drag state on any drag move
  const handleDragMove = () => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    isDraggingRef.current = true;
    setIsHoldingForConnection(false);
    setDraggable(true);
  };
  const groupRef = useRef<any>(null);
  const [draggable, setDraggable] = useState(true);
  const isDraggingRef = useRef(false);
  
  // Resize state management for text objects
  const resizeStartRef = useRef<{ width: number; height: number; startX: number; startY: number } | null>(null);
  const [resizingDimensions, setResizingDimensions] = useState<{ width: number; height: number } | null>(null);

  // Calculate anchor points based on object type
  const getAnchorPoints = () => {
    const points: { x: number; y: number; position: string }[] = [];
    
    if (obj.type === 'line' || obj.type === 'arrow') {
      // For lines and arrows, anchors at start and end
      const linePoints = obj.points || [0, 0, obj.width, 0];
      points.push(
        { x: linePoints[0], y: linePoints[1], position: 'start' },
        { x: linePoints[2], y: linePoints[3], position: 'end' }
      );
    } else {
      // For other shapes, anchors on all four sides
      points.push(
        { x: obj.width / 2, y: 0, position: 'top' },
        { x: obj.width, y: obj.height / 2, position: 'right' },
        { x: obj.width / 2, y: obj.height, position: 'bottom' },
        { x: 0, y: obj.height / 2, position: 'left' }
      );
    }
    
    return points;
  };

  // Architectural component types that support displayName editing
  const architecturalTypes = [
    'api-gateway', 'microservice', 'database', 'cache', 'message-queue', 
    'load-balancer', 'storage', 'cdn', 'lambda', 'container', 'kubernetes', 
    'cloud', 'server', 'user', 'mobile-app', 'web-app', 'firewall', 'monitor', 'text-box'
  ];
  const isEditableType = obj.type === 'text' || architecturalTypes.includes(obj.type);

  // Handle text editing
  const handleTextDblClick = () => {
    if (isEditableType && onStartTextEdit) {
      onSelect();
      
      // Calculate position for HTML textarea overlay
      if (groupRef.current) {
        const stage = groupRef.current.getStage();
        const container = stage.container();
        const containerRect = container.getBoundingClientRect();
        
        // Get absolute position of the group (already includes stage offset)
        const absPosition = groupRef.current.absolutePosition();
        
        // Add scroll offsets for mobile device compatibility
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft || 0;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
        
        onStartTextEdit({
          x: containerRect.left + absPosition.x + scrollX,
          y: containerRect.top + absPosition.y + scrollY,
        });
      }
    }
  };

  // Handle tap-and-hold for connection on mobile devices
  const holdTimer = useRef<NodeJS.Timeout | null>(null);
  const [isHoldingForConnection, setIsHoldingForConnection] = useState(false);
  const initialPosition = useRef<{ x: number; y: number } | null>(null);
  
  const handleTouchStart = (e: any) => {
    // Clear any existing timer
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
    }
    // Store initial position
    initialPosition.current = { x: obj.x, y: obj.y };
    isDraggingRef.current = false;
    // Start 1-second hold timer
    holdTimer.current = setTimeout(() => {
      if (isDraggingRef.current) return; // Don't start connection if drag started
      setIsHoldingForConnection(true);
      setDraggable(false); // Disable dragging when starting connection
      // Start connection drag from nearest anchor
      if (onAnchorDragStart && groupRef.current) {
        const stage = groupRef.current.getStage();
        if (stage) {
          const pointerPos = stage.getPointerPosition();
          if (pointerPos) {
            // Find nearest anchor to the tap position
            const anchors = getAnchorPoints();
            const pointerAbsX = pointerPos.x;
            const pointerAbsY = pointerPos.y;
            let nearestAnchor = anchors[0];
            let minDistance = Infinity;
            
            anchors.forEach(anchor => {
              const anchorAbsX = obj.x + anchor.x;
              const anchorAbsY = obj.y + anchor.y;
              const distance = Math.sqrt(
                Math.pow(pointerAbsX - anchorAbsX, 2) + 
                Math.pow(pointerAbsY - anchorAbsY, 2)
              );
              if (distance < minDistance) {
                minDistance = distance;
                nearestAnchor = anchor;
              }
            });

            onAnchorDragStart(nearestAnchor.position, obj.x + nearestAnchor.x, obj.y + nearestAnchor.y);
          }
        }
      }
    }, 1000); // 1 second hold
  };
  
  const handleTouchEnd = () => {
    // Clear the hold timer if touch ends before 1 second
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
    }
    setIsHoldingForConnection(false);
    setDraggable(true); // Re-enable dragging after connection ends
    initialPosition.current = null;
    isDraggingRef.current = false;
  };
  
  // Cleanup timer on unmount
  useEffect(() => {
    // Cleanup timer and drag state on unmount or when obj.name changes
    return () => {
      if (holdTimer.current) {
        clearTimeout(holdTimer.current);
        holdTimer.current = null;
      }
      isDraggingRef.current = false;
      setIsHoldingForConnection(false);
      setDraggable(true);
    };
  }, [obj.name]);

  // Reset drag/connection state when resetInteraction changes
  useEffect(() => {
    setIsHoldingForConnection(false);
    setDraggable(true);
    isDraggingRef.current = false;
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  }, [resetInteraction]);

  // Auto-focus new text objects
  const prevActive = useRef(active);
  useEffect(() => {
    if (obj.type === 'text' && active && !prevActive.current && obj.content === 'New Text Idea') {
      handleTextDblClick();
    }
    prevActive.current = active;
  }, [obj.type, active, obj.content]);

  const handleDragEnd = (e: any) => {
    const node = e.target;
    onUpdate({
      x: node.x(),
      y: node.y(),
    });
    if (typeof onDragEndObject === 'function') onDragEndObject();
    // Reset position tracking
    initialPosition.current = null;
  };

  const handleDragStart = () => {
    // Cancel connection timer when drag starts
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    isDraggingRef.current = true;
    setIsHoldingForConnection(false);
    setDraggable(true); // Always re-enable dragging on drag start
    if (typeof onDragStartObject === 'function') onDragStartObject();
  };

  const renderShape = () => {
    // Use resizing dimensions if actively resizing, otherwise use obj dimensions
    const displayWidth = resizingDimensions?.width ?? obj.width;
    const displayHeight = resizingDimensions?.height ?? obj.height;
    
    switch (obj.type) {
      case 'text':
        return (
          <>
            <Rect
              x={0}
              y={0}
              width={displayWidth}
              height={displayHeight}
              fill={obj.backgroundColor || 'white'}
              shadowBlur={active ? 10 : 5}
              shadowOpacity={0.3}
              opacity={isGrayedOut && !active ? 0.4 : 1}
            />
            <KonvaText
              x={8}
              y={8}
              width={displayWidth - 16}
              height={displayHeight - 16}
              text={obj.content || 'Double-click to edit'}
              fontSize={obj.fontSize || 14}
              fontStyle={obj.fontStyle || 'normal'}
              fill={obj.color || '#000000'}
              wrap="word"
              align="left"
              verticalAlign="top"
            />
            {active && (
              <Rect
                x={0}
                y={0}
                width={displayWidth}
                height={displayHeight}
                stroke="#3B82F6"
                strokeWidth={2}
              />
            )}
          </>
        );
      
      case 'image':
        return <ImageShape obj={obj} active={active} isGrayedOut={isGrayedOut} />;
      
      case 'svg':
        return (
          <>
            <Path
              x={0}
              y={0}
              data={obj.content}
              fill={obj.color || '#000000'}
              scaleX={obj.width / 24}
              scaleY={obj.height / 24}
              opacity={isGrayedOut && !active ? 0.4 : 1}
            />
            {active && (
              <Rect
                x={0}
                y={0}
                width={obj.width}
                height={obj.height}
                stroke="#3B82F6"
                strokeWidth={2}
              />
            )}
          </>
        );
      
      case 'color':
        return (
          <Rect
            x={0}
            y={0}
            width={obj.width}
            height={obj.height}
            fill={obj.color}
            stroke={obj.borderColor || (active ? '#3B82F6' : undefined)}
            strokeWidth={obj.borderWidth || (active ? 2 : 0)}
            cornerRadius={8}
            opacity={isGrayedOut && !active ? 0.4 : 1}
          />
        );
      
      case 'line':
        const linePoints = obj.points || [0, 0, obj.width, 0];
        const minX = Math.min(linePoints[0], linePoints[2]);
        const minY = Math.min(linePoints[1], linePoints[3]);
        const maxX = Math.max(linePoints[0], linePoints[2]);
        const maxY = Math.max(linePoints[1], linePoints[3]);
        const boundWidth = maxX - minX || 20;
        const boundHeight = maxY - minY || 20;
        
        return (
          <>
            {active && (
              <Rect
                x={minX - 10}
                y={minY - 10}
                width={boundWidth + 20}
                height={boundHeight + 20}
                stroke="#3B82F6"
                strokeWidth={1}
                dash={[5, 5]}
                opacity={0.5}
              />
            )}
            <Line
              points={linePoints}
              stroke={obj.color || '#000000'}
              strokeWidth={3}
              dash={obj.strokeDashArray}
              lineCap="round"
              opacity={isGrayedOut && !active ? 0.4 : 1}
            />
          </>
        );
      
      case 'arrow':
        const arrowPoints = obj.points || [0, obj.height / 2, obj.width, obj.height / 2];
        const arrMinX = Math.min(arrowPoints[0], arrowPoints[2]);
        const arrMinY = Math.min(arrowPoints[1], arrowPoints[3]);
        const arrMaxX = Math.max(arrowPoints[0], arrowPoints[2]);
        const arrMaxY = Math.max(arrowPoints[1], arrowPoints[3]);
        const arrBoundWidth = arrMaxX - arrMinX || 20;
        const arrBoundHeight = arrMaxY - arrMinY || 20;
        
        return (
          <>
            {active && (
              <Rect
                x={arrMinX - 10}
                y={arrMinY - 10}
                width={arrBoundWidth + 20}
                height={arrBoundHeight + 20}
                stroke="#3B82F6"
                strokeWidth={1}
                dash={[5, 5]}
                opacity={0.5}
              />
            )}
            <Arrow
              points={arrowPoints}
              stroke={obj.color || '#000000'}
              fill={obj.color || '#000000'}
              strokeWidth={3}
              pointerLength={10}
              pointerWidth={10}
              opacity={isGrayedOut && !active ? 0.4 : 1}
            />
          </>
        );
      
      case 'circle':
        return (
          <>
            <KonvaCircle
              x={obj.width / 2}
              y={obj.height / 2}
              radius={Math.min(obj.width, obj.height) / 2}
              fill={obj.color}
              opacity={isGrayedOut && !active ? 0.4 : 1}
            />
            {active && (
              <Rect
                x={0}
                y={0}
                width={obj.width}
                height={obj.height}
                stroke="#3B82F6"
                strokeWidth={2}
              />
            )}
          </>
        );
      
      case 'rectangle':
        return (
          <Rect
            x={0}
            y={0}
            width={obj.width}
            height={obj.height}
            fill={obj.color}
            stroke={active ? '#3B82F6' : undefined}
            strokeWidth={active ? 2 : 0}
            cornerRadius={4}
            opacity={isGrayedOut && !active ? 0.4 : 1}
          />
        );
      
      case 'triangle':
        return (
          <>
            <RegularPolygon
              x={obj.width / 2}
              y={obj.height / 2}
              sides={3}
              radius={Math.min(obj.width, obj.height) / 2}
              fill={obj.color}
              rotation={-90}
              opacity={isGrayedOut && !active ? 0.4 : 1}
            />
            {active && (
              <Rect
                x={0}
                y={0}
                width={obj.width}
                height={obj.height}
                stroke="#3B82F6"
                strokeWidth={2}
              />
            )}
          </>
        );
      
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
        const componentDef = ARCHITECTURE_COMPONENTS[obj.type as keyof typeof ARCHITECTURE_COMPONENTS];
        if (!componentDef) return null;
        
        // Check if this is a text-box and if it has custom content
        const isTextBox = obj.type === 'text-box';
        const hasCustomContent = isTextBox && obj.content && obj.content.trim() !== '';
        
        // Determine display text: use displayName > content > name > default label
        // This supports the displayName field for UI customization
        const displayText = obj.displayName || obj.content || (isTextBox ? 'Double-click to edit' : componentDef.label);
        
        return (
          <>
            {/* Background with border - transparent fill */}
            <Rect
              x={0}
              y={0}
              width={displayWidth}
              height={displayHeight}
              fill="transparent"
              stroke={obj.borderColor || componentDef.color}
              strokeWidth={2}
              cornerRadius={8}
              shadowBlur={active ? 12 : 6}
              shadowOpacity={0.3}
              shadowColor="#000000"
              opacity={isGrayedOut && !active ? 0.4 : 1}
            />
            
            {/* Show icon only if NOT text-box with content */}
            {!hasCustomContent && (
              <Path
                x={displayWidth / 2}
                y={displayHeight / 2}
                data={componentDef.iconPath}
                stroke={obj.borderColor || componentDef.color}
                strokeWidth={2}
                fill="transparent"
                scaleX={(displayWidth * 0.6) / 24}
                scaleY={(displayHeight * 0.6) / 24}
                offsetX={12}
                offsetY={12}
                opacity={1}
                lineCap="round"
                lineJoin="round"
              />
            )}
            
            {/* Label - show custom content or default label */}
            <KonvaText
              x={hasCustomContent ? 8 : 4}
              y={hasCustomContent ? 8 : displayHeight - 18}
              width={hasCustomContent ? displayWidth - 16 : displayWidth - 8}
              height={hasCustomContent ? displayHeight - 16 : undefined}
              text={displayText}
              fontSize={hasCustomContent ? (obj.fontSize || 12) : 9}
              fontStyle={hasCustomContent ? (obj.fontStyle || 'normal') : '600'}
              fill={obj.color || '#000000'}
              align={hasCustomContent ? 'left' : 'center'}
              verticalAlign={hasCustomContent ? 'top' : undefined}
              wrap={hasCustomContent ? 'word' : undefined}
            />
            
            {/* Border when active */}
            {active && (
              <Rect
                x={0}
                y={0}
                width={displayWidth}
                height={displayHeight}
                stroke="#3B82F6"
                strokeWidth={3}
                cornerRadius={8}
              />
            )}
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <Group
      ref={groupRef}
      x={obj.x + (groupDragOffset?.x || 0)}
      y={obj.y + (groupDragOffset?.y || 0)}
      draggable={draggable}
      onDragStart={(e) => {
        handleDragStart();
        if (typeof onDragStartObject === 'function') onDragStartObject();
      }}
      onDragMove={handleDragMove}
      onDragEnd={(e) => {
        handleDragEnd(e);
        if (typeof onDragEndObject === 'function') onDragEndObject();
      }}
      onClick={onSelect}
      onTap={onSelect}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onDblClick={handleTextDblClick}
      onDblTap={handleTextDblClick}
    >
      {renderShape()}
      
      {/* Anchor points for connections - show when active */}
      {active && getAnchorPoints().map((anchor, index) => (
        <Group key={index}>
          <KonvaCircle
            x={anchor.x}
            y={anchor.y}
            radius={6}
            fill="white"
            stroke="#3B82F6"
            strokeWidth={2}
            shadowBlur={4}
            shadowOpacity={0.3}
            draggable={false}
            onMouseEnter={(e) => {
              const stage = e.target.getStage();
              if (stage) stage.container().style.cursor = 'pointer';
            }}
            onMouseLeave={(e) => {
              const stage = e.target.getStage();
              if (stage) stage.container().style.cursor = 'default';
            }}
            onMouseDown={(e) => {
              e.cancelBubble = true;
              
              if (onAnchorDragStart && groupRef.current) {
                const stage = groupRef.current.getStage();
                if (stage) {
                  // Get absolute position of the anchor
                  onAnchorDragStart(anchor.position, obj.x + anchor.x, obj.y + anchor.y);
                }
              }
            }}
          />
        </Group>
      ))}
      
      {/* Resize handle for text objects - only visible when active */}
      {(() => {
        const shouldShowResize = active && (obj.type === 'text' || obj.type === 'text-box');
        return shouldShowResize && (
          <Group
            x={(resizingDimensions?.width ?? obj.width) - 20}
            y={(resizingDimensions?.height ?? obj.height) - 20}
            draggable={true}
            onMouseEnter={(e) => {
              const stage = e.target.getStage();
              if (stage) stage.container().style.cursor = 'nwse-resize';
            }}
            onMouseLeave={(e) => {
              const stage = e.target.getStage();
              if (stage) stage.container().style.cursor = 'default';
            }}
            onDragStart={(e) => {
            // Stop event from bubbling to parent group
            e.cancelBubble = true;
            
            // Set cursor during drag
            const stage = e.target.getStage();
            if (stage) stage.container().style.cursor = 'nwse-resize';
            
            const pointerPos = stage?.getPointerPosition();
            
            // Store starting dimensions and pointer position
            resizeStartRef.current = {
              width: obj.width,
              height: obj.height,
              startX: pointerPos?.x || 0,
              startY: pointerPos?.y || 0,
            };
          }}
          onDragMove={(e) => {
            // Stop event from bubbling
            e.cancelBubble = true;
            
            const stage = e.target.getStage();
            const pointerPos = stage?.getPointerPosition();
            const startData = resizeStartRef.current;
            
            if (startData && pointerPos) {
              // Calculate delta from start position
              const deltaX = pointerPos.x - startData.startX;
              const deltaY = pointerPos.y - startData.startY;
              
              // Calculate new dimensions with minimum size constraints
              const minWidth = 60;
              const minHeight = 40;
              const newWidth = Math.max(minWidth, startData.width + deltaX);
              const newHeight = Math.max(minHeight, startData.height + deltaY);
              
              // Update live preview
              setResizingDimensions({
                width: newWidth,
                height: newHeight,
              });
            }
            
            // Reset the handle position (it should stay at corner)
            const node = e.target;
            node.x(0);
            node.y(0);
          }}
          onDragEnd={(e) => {
            // Stop event from bubbling
            e.cancelBubble = true;
            
            const stage = e.target.getStage();
            if (stage) stage.container().style.cursor = 'default';
            
            const startData = resizeStartRef.current;
            
            if (startData && resizingDimensions) {
              // Commit the resize
              onUpdate({
                width: resizingDimensions.width,
                height: resizingDimensions.height,
              });
            }
            
            // Clean up
            resizeStartRef.current = null;
            setResizingDimensions(null);
            
            // Reset handle position
            const node = e.target;
            node.x(0);
            node.y(0);
          }}
        >
          {/* Resize handle background */}
          <Rect
            x={0}
            y={0}
            width={20}
            height={20}
            fill="#4CAF50"
            stroke="#2196F3"
            strokeWidth={1}
            cornerRadius={4}
            opacity={1}
            shadowBlur={4}
            shadowColor="black"
            shadowOpacity={0.5}
            shadowOffsetX={2}
            shadowOffsetY={2}
          />
          {/* Resize handle icon (diagonal lines) */}
          <Line
            points={[6, 14, 14, 6]}
            stroke="white"
            strokeWidth={2}
            lineCap="round"
          />
          <Line
            points={[10, 14, 14, 10]}
            stroke="white"
            strokeWidth={2}
            lineCap="round"
          />
        </Group>
      );
      })()}
      
      {/* Position indicator for active objects */}
      {active && obj.type !== 'text' && obj.type !== 'text-box' && (
        <>
          <Rect
            x={obj.width / 2 - 40}
            y={obj.height + 8}
            width={80}
            height={20}
            fill="#1F2937"
            cornerRadius={4}
          />
          <KonvaText
            x={obj.width / 2 - 40}
            y={obj.height + 11}
            width={80}
            text={`${Math.round(obj.x)}, ${Math.round(obj.y)}`}
            fontSize={10}
            fill="white"
            align="center"
          />
        </>
      )}
    </Group>
  );
};

export default DraggableObject;
