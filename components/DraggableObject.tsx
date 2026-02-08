import React, { useState, useEffect, useRef } from 'react';
import { Rect, Text as KonvaText, Image as KonvaImage, Path, Group, Line, Arrow, Circle as KonvaCircle, RegularPolygon } from 'react-konva';
import { CanvasObject } from '../types';
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
  obj, active, isGrayedOut, onSelect, onUpdate, onStartTextEdit, onAnchorDragStart, resetInteraction, onDragStartObject, onDragEndObject
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

  // Handle text editing
  const handleTextDblClick = () => {
    if (obj.type === 'text' && onStartTextEdit) {
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
            const pointerAbsX = pointerPos.x;
            const pointerAbsY = pointerPos.y;
            let nearestAnchor = anchors[0];
            let minDistance = Infinity;
            
            anchors.forEach(anchor => {
              const anchorAbsX = absPos.x + anchor.x;
              const anchorAbsY = absPos.y + anchor.y;
              const distance = Math.sqrt(
                Math.pow(pointerAbsX - anchorAbsX, 2) + 
                Math.pow(pointerAbsY - anchorAbsY, 2)
              );
              if (distance < minDistance) {
                minDistance = distance;
                nearestAnchor = anchor;
              }
            });
            // Start connection drag from nearest anchor
            const anchorAbsX = absPos.x + nearestAnchor.x;
            const anchorAbsY = absPos.y + nearestAnchor.y;
            onAnchorDragStart(nearestAnchor.position, anchorAbsX, anchorAbsY);
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
    // Cleanup timer and drag state on unmount or when obj.id changes
    return () => {
      if (holdTimer.current) {
        clearTimeout(holdTimer.current);
        holdTimer.current = null;
      }
      isDraggingRef.current = false;
      setIsHoldingForConnection(false);
      setDraggable(true);
    };
  }, [obj.id]);

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
    switch (obj.type) {
      case 'text':
        return (
          <>
            <Rect
              x={0}
              y={0}
              width={obj.width}
              height={obj.height}
              fill={obj.backgroundColor || 'white'}
              shadowBlur={active ? 10 : 5}
              shadowOpacity={0.3}
              opacity={isGrayedOut && !active ? 0.4 : 1}
            />
            <KonvaText
              x={8}
              y={8}
              width={obj.width - 16}
              height={obj.height - 16}
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
                width={obj.width}
                height={obj.height}
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
      
      default:
        return null;
    }
  };

  return (
    <Group
      ref={groupRef}
      x={obj.x}
      y={obj.y}
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
                  const absPos = groupRef.current.absolutePosition();
                  const anchorAbsX = absPos.x + anchor.x;
                  const anchorAbsY = absPos.y + anchor.y;
                  
                  onAnchorDragStart(anchor.position, anchorAbsX, anchorAbsY);
                }
              }
            }}
          />
        </Group>
      ))}
      
      {/* Position indicator for active objects */}
      {active && (
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
