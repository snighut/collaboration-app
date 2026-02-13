import React, { useRef, useState } from 'react';
import { Rect, Text as KonvaText, Group, Line } from 'react-konva';
import { DesignGroup, CanvasObject } from '../types';

// Default group dimensions
const DEFAULT_GROUP_WIDTH = 200;
const DEFAULT_GROUP_HEIGHT = 150;
const MIN_GROUP_WIDTH = 100;
const MIN_GROUP_HEIGHT = 80;

interface DesignGroupRendererProps {
  designGroups: DesignGroup[];
  objects: CanvasObject[];
  onSelect?: (groupId: string) => void;
  activeGroupId?: string | null;
  onGroupDragStart?: (groupId: string, objectNames: string[]) => void;
  onGroupDragMove?: (groupId: string, deltaX: number, deltaY: number) => void;
  onGroupDragEnd?: (groupId: string, deltaX: number, deltaY: number, objectNames: string[]) => void;
  onGroupResize?: (groupId: string, newWidth: number, newHeight: number) => void;
  onStartGroupNameEdit?: (groupId: string, position: { x: number; y: number }) => void;
}

/**
 * Helper function to determine which objects are within a design group's bounds
 * An object is considered "in" a group if its center point falls within the group's boundaries
 */
const getObjectsInGroup = (
  group: DesignGroup,
  objects: CanvasObject[],
  groupWidth: number = DEFAULT_GROUP_WIDTH,
  groupHeight: number = DEFAULT_GROUP_HEIGHT
): CanvasObject[] => {
  const groupX = group.uidata?.x || 0;
  const groupY = group.uidata?.y || 0;
  
  return objects.filter(obj => {
    // Calculate object center
    const objCenterX = obj.x + obj.width / 2;
    const objCenterY = obj.y + obj.height / 2;
    
    // Check if center is within group bounds
    return (
      objCenterX >= groupX &&
      objCenterX <= groupX + groupWidth &&
      objCenterY >= groupY &&
      objCenterY <= groupY + groupHeight
    );
  });
};

/**
 * Helper function to calculate bounding box for items in a design group
 */
const calculateGroupBounds = (
  group: DesignGroup,
  objects: CanvasObject[]
): { x: number; y: number; width: number; height: number } => {
  // If group has explicit position, use it as base
  const baseX = group.uidata?.x || 0;
  const baseY = group.uidata?.y || 0;

  // Use stored dimensions or fall back to defaults
  const width = group.uidata?.width || DEFAULT_GROUP_WIDTH;
  const height = group.uidata?.height || DEFAULT_GROUP_HEIGHT;

  return {
    x: baseX,
    y: baseY,
    width,
    height,
  };
};

/**
 * Helper function to convert borderStyle to stroke dash array
 */
const getBorderDashArray = (borderStyle?: 'solid' | 'dashed' | 'dotted'): number[] | undefined => {
  switch (borderStyle) {
    case 'dashed':
      return [10, 5];
    case 'dotted':
      return [2, 4];
    case 'solid':
    default:
      return undefined;
  }
};

/**
 * DesignGroupRenderer component - renders styled design group boundaries
 */
const DesignGroupRenderer: React.FC<DesignGroupRendererProps> = ({
  designGroups,
  objects,
  onSelect,
  activeGroupId,
  onGroupDragStart,
  onGroupDragMove,
  onGroupDragEnd,
  onGroupResize,
  onStartGroupNameEdit,
}) => {
  // Track drag start positions for each group
  const dragStartRef = useRef<{ [groupId: string]: { x: number; y: number; objectNames: string[] } }>({});
  // Track resize start for each group
  const resizeStartRef = useRef<{ [groupId: string]: { width: number; height: number; startX: number; startY: number } }>({});
  // Track live resize dimensions for preview
  const [resizingGroup, setResizingGroup] = useState<{ groupId: string; width: number; height: number } | null>(null);
  // Ref for getting absolute positions
  const groupRefs = useRef<{ [groupId: string]: any }>({});
  
  return (
    <>
      {designGroups.map((group) => {
        const bounds = calculateGroupBounds(group, objects);
        // Use live resize dimensions if this group is being resized
        const displayWidth = resizingGroup?.groupId === group.id ? resizingGroup.width : bounds.width;
        const displayHeight = resizingGroup?.groupId === group.id ? resizingGroup.height : bounds.height;
        const borderColor = group.uidata?.borderColor || '#4CAF50';
        const borderThickness = group.uidata?.borderThickness || 2;
        const borderStyle = group.uidata?.borderStyle || 'dashed';
        const dashArray = getBorderDashArray(borderStyle);
        const isActive = activeGroupId === group.id;

        const handleDragStart = (e: any) => {
          // Stop event from bubbling to stage
          e.cancelBubble = true;
          
          // Get current position
          const node = e.target;
          
          // Calculate which objects are currently in this group BEFORE dragging
          const objectsInGroup = getObjectsInGroup(group, objects, bounds.width, bounds.height);
          const objectNames = objectsInGroup.map(obj => obj.name);
          
          // Store the start position and object names
          dragStartRef.current[group.id] = {
            x: node.x(),
            y: node.y(),
            objectNames,
          };
          
          // Notify parent that drag started (with object names for real-time tracking)
          if (onGroupDragStart) {
            onGroupDragStart(group.id, objectNames);
          }
          
          // Select this group
          if (onSelect) {
            onSelect(group.id);
          }
        };
        
        const handleDragMove = (e: any) => {
          // Stop event from bubbling to stage
          e.cancelBubble = true;
          
          const node = e.target;
          const startData = dragStartRef.current[group.id];
          
          if (startData && onGroupDragMove) {
            // Calculate current delta
            const deltaX = node.x() - startData.x;
            const deltaY = node.y() - startData.y;
            
            // Notify parent of the current drag position
            onGroupDragMove(group.id, deltaX, deltaY);
          }
        };
        
        const handleDragEnd = (e: any) => {
          // Stop event from bubbling to stage
          e.cancelBubble = true;
          
          const node = e.target;
          const startData = dragStartRef.current[group.id];
          
          if (startData && onGroupDragEnd) {
            // Calculate delta
            const deltaX = node.x() - startData.x;
            const deltaY = node.y() - startData.y;
            
            // Reset the group position back (the reducer will update it properly)
            node.x(startData.x);
            node.y(startData.y);
            
            // Call the handler with delta and object names
            onGroupDragEnd(group.id, deltaX, deltaY, startData.objectNames);
          }
          
          // Clean up
          delete dragStartRef.current[group.id];
        };

        return (
          <Group 
            key={`group-${group.id}`}
            ref={(node) => { if (node) groupRefs.current[group.id] = node; }}
            x={bounds.x}
            y={bounds.y}
            draggable={true}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
          >
            {/* Group boundary rectangle - position is relative to parent Group now */}
            <Rect
              x={0}
              y={0}
              width={displayWidth}
              height={displayHeight}
              stroke={borderColor}
              strokeWidth={isActive ? borderThickness + 1 : borderThickness}
              dash={dashArray}
              fill="transparent"
              opacity={isActive ? 0.9 : 0.6}
              cornerRadius={8}
              onClick={() => onSelect && onSelect(group.id)}
              onTap={() => onSelect && onSelect(group.id)}
            />

            {/* Group label - draggable indicator, supports displayName */}
            {(() => {
              // Use displayName if available, otherwise fall back to name
              const labelText = group.displayName || group.name;
              const labelWidth = labelText.length * 8 + 16;
              
              const handleLabelDblClick = () => {
                if (onStartGroupNameEdit && groupRefs.current[group.id]) {
                  const stage = groupRefs.current[group.id].getStage();
                  const container = stage.container();
                  const containerRect = container.getBoundingClientRect();
                  const absPosition = groupRefs.current[group.id].absolutePosition();
                  
                  const scrollX = window.pageXOffset || document.documentElement.scrollLeft || 0;
                  const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
                  
                  onStartGroupNameEdit(group.id, {
                    x: containerRect.left + absPosition.x + 10 + scrollX,
                    y: containerRect.top + absPosition.y - 12 + scrollY,
                  });
                }
              };
              
              return (
                <>
                  <Rect
                    x={10}
                    y={-12}
                    width={labelWidth}
                    height={20}
                    fill={borderColor}
                    cornerRadius={4}
                    opacity={0.9}
                    onDblClick={handleLabelDblClick}
                    onDblTap={handleLabelDblClick}
                  />
                  <KonvaText
                    x={18}
                    y={-8}
                    text={labelText}
                    fontSize={12}
                    fontStyle="bold"
                    fill="white"
                    onDblClick={handleLabelDblClick}
                    onDblTap={handleLabelDblClick}
                  />
                </>
              );
            })()}
            
            {/* Drag handle indicator icon (move cursor hint) */}
            {(() => {
              const labelText = group.displayName || group.name;
              return (
                <>
                  <Rect
                    x={labelText.length * 8 + 22}
                    y={-10}
                    width={16}
                    height={16}
                    fill="rgba(255,255,255,0.3)"
                    cornerRadius={3}
                  />
                  <KonvaText
                    x={labelText.length * 8 + 25}
                    y={-8}
                    text="⋮⋮"
                    fontSize={10}
                    fill="white"
                  />
                </>
              );
            })()}

            {/* Optional description tooltip area */}
            {group.description && isActive && (
              <>
                <Rect
                  x={10}
                  y={displayHeight - 30}
                  width={Math.min(displayWidth - 20, 200)}
                  height={25}
                  fill={borderColor}
                  cornerRadius={4}
                  opacity={0.8}
                />
                <KonvaText
                  x={16}
                  y={displayHeight - 26}
                  text={group.description}
                  fontSize={10}
                  fill="white"
                  width={Math.min(displayWidth - 32, 188)}
                  ellipsis={true}
                />
              </>
            )}
            
            {/* Resize handle - only visible when group is active/selected */}
            {isActive && (
              <Group
                x={displayWidth - 20}
                y={displayHeight - 20}
                draggable={true}
                onDragStart={(e) => {
                  // Stop event from bubbling to parent group
                  e.cancelBubble = true;
                  
                  // Get the stage for pointer position
                  const stage = e.target.getStage();
                  const pointerPos = stage?.getPointerPosition();
                  
                  // Store starting dimensions and pointer position
                  resizeStartRef.current[group.id] = {
                    width: displayWidth,
                    height: displayHeight,
                    startX: pointerPos?.x || 0,
                    startY: pointerPos?.y || 0,
                  };
                }}
                onDragMove={(e) => {
                  // Stop event from bubbling
                  e.cancelBubble = true;
                  
                  const stage = e.target.getStage();
                  const pointerPos = stage?.getPointerPosition();
                  const startData = resizeStartRef.current[group.id];
                  
                  if (startData && pointerPos) {
                    // Calculate delta from start position
                    const deltaX = pointerPos.x - startData.startX;
                    const deltaY = pointerPos.y - startData.startY;
                    
                    // Calculate new dimensions with minimum size constraints
                    const newWidth = Math.max(MIN_GROUP_WIDTH, startData.width + deltaX);
                    const newHeight = Math.max(MIN_GROUP_HEIGHT, startData.height + deltaY);
                    
                    // Update live preview
                    setResizingGroup({
                      groupId: group.id,
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
                  
                  const startData = resizeStartRef.current[group.id];
                  
                  if (startData && resizingGroup && onGroupResize) {
                    // Commit the resize
                    onGroupResize(group.id, resizingGroup.width, resizingGroup.height);
                  }
                  
                  // Clean up
                  delete resizeStartRef.current[group.id];
                  setResizingGroup(null);
                  
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
                  fill={borderColor}
                  cornerRadius={[0, 0, 6, 0]}
                  opacity={0.9}
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
            )}
          </Group>
        );
      })}
    </>
  );
};

export default DesignGroupRenderer;
