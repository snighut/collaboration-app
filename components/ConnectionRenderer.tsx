import React from 'react';
import { Line, Arrow, Circle, Group, Path, Text, Rect, Label, Tag } from 'react-konva';
import { Connection, CanvasObject } from '../types';
import { ConnectionType, getConnectionTypeDefinition, getDefaultStyleForType } from '../lib/connectionTypes';

interface ConnectionRendererProps {
  connections: Connection[];
  objects: CanvasObject[];
  groupDragState?: {
    groupId: string;
    objectNames: string[];
    offsetX: number;
    offsetY: number;
  } | null;
  activeConnectionIndex?: number | null;
  onConnectionClick?: (index: number) => void;
}

/**
 * Helper function to get anchor position based on object and anchor point
 * Applies groupDragState offset for real-time visual updates during group drag
 */
const getAnchorPosition = (
  objName: string,
  position: string,
  objects: CanvasObject[],
  groupDragState?: {
    groupId: string;
    objectNames: string[];
    offsetX: number;
    offsetY: number;
  } | null
): { x: number; y: number } => {
  const obj = objects.find(o => o.name === objName);
  if (!obj) return { x: 0, y: 0 };

  // Apply group drag offset if this object is being dragged as part of a group
  const offsetX = groupDragState && groupDragState.objectNames.includes(objName) ? groupDragState.offsetX : 0;
  const offsetY = groupDragState && groupDragState.objectNames.includes(objName) ? groupDragState.offsetY : 0;

  let x = obj.x + offsetX;
  let y = obj.y + offsetY;

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
 * Calculate midpoint between two points
 */
const getMidpoint = (x1: number, y1: number, x2: number, y2: number) => ({
  x: (x1 + x2) / 2,
  y: (y1 + y2) / 2,
});

/**
 * Calculate angle between two points
 */
const getAngle = (x1: number, y1: number, x2: number, y2: number) => {
  return Math.atan2(y2 - y1, x2 - x1);
};

/**
 * Render diamond shape for aggregation/composition
 */
const renderDiamond = (
  x: number,
  y: number,
  angle: number,
  filled: boolean,
  color: string,
  size: number = 12
) => {
  const points = [
    0, 0,
    size, size / 2,
    0, size,
    -size, size / 2,
  ];
  
  return (
    <Group x={x} y={y} rotation={(angle * 180) / Math.PI}>
      <Line
        points={points}
        closed={true}
        fill={filled ? color : 'white'}
        stroke={color}
        strokeWidth={2}
      />
    </Group>
  );
};

/**
 * Render hollow triangle for generalization/inheritance
 */
const renderHollowTriangle = (
  x: number,
  y: number,
  angle: number,
  color: string,
  size: number = 12
) => {
  const height = size * 1.5;
  const width = size;
  
  const points = [
    0, 0,
    -width / 2, height,
    width / 2, height,
  ];
  
  return (
    <Group x={x} y={y} rotation={(angle * 180) / Math.PI}>
      <Line
        points={points}
        closed={true}
        fill="white"
        stroke={color}
        strokeWidth={2}
      />
    </Group>
  );
};

/**
 * Render double-headed arrow for bidirectional connections
 */
const renderBidirectionalArrow = (
  points: number[],
  color: string,
  thickness: number,
  dashArray?: number[]
) => {
  return (
    <Group>
      <Arrow
        points={points}
        stroke={color}
        strokeWidth={thickness}
        fill={color}
        dash={dashArray}
        opacity={0.8}
        pointerLength={10}
        pointerWidth={10}
        pointerAtBeginning={true}
      />
    </Group>
  );
};

/**
 * Generate smooth curved path with improved bezier curves (like eraser.io)
 */
const getSmoothCurvedPath = (x1: number, y1: number, x2: number, y2: number): string => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Calculate control points for smooth S-curve
  // Control points are offset horizontally for natural flow
  const controlOffset = Math.min(distance * 0.5, 150); // Cap the offset for very long lines
  
  const isHorizontal = Math.abs(dx) > Math.abs(dy);
  
  if (isHorizontal) {
    // For horizontal connections, control points offset in X direction
    const controlX1 = x1 + controlOffset;
    const controlX2 = x2 - controlOffset;
    return `M ${x1} ${y1} C ${controlX1} ${y1}, ${controlX2} ${y2}, ${x2} ${y2}`;
  } else {
    // For vertical connections, control points offset in Y direction
    const controlY1 = y1 + controlOffset;
    const controlY2 = y2 - controlOffset;
    return `M ${x1} ${y1} C ${x1} ${controlY1}, ${x2} ${controlY2}, ${x2} ${y2}`;
  }
};

/**
 * Generate curved path points (legacy - keeping for compatibility)
 */
const getCurvedPath = (x1: number, y1: number, x2: number, y2: number): string => {
  return getSmoothCurvedPath(x1, y1, x2, y2);
};

/**
 * Generate stepped path points (for message queues)
 */
const getSteppedPath = (x1: number, y1: number, x2: number, y2: number): string => {
  const midX = (x1 + x2) / 2;
  return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
};

/**
 * Generate orthogonal (rectilinear) path with 90-degree corners like Eraser.io
 * This intelligently routes based on anchor positions for natural-looking connections
 */
const getOrthogonalPath = (
  x1: number, 
  y1: number, 
  x2: number, 
  y2: number,
  fromPoint: string,
  toPoint: string
): string => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  
  // Minimum segment length for clarity
  const minSegment = 30;
  
  // Determine routing based on anchor points
  const isFromHorizontal = fromPoint === 'left' || fromPoint === 'right';
  const isToHorizontal = toPoint === 'left' || toPoint === 'right';
  
  // Helper to check if anchors are facing each other (optimal routing)
  const areFacingEachOther = () => {
    if (fromPoint === 'right' && toPoint === 'left' && dx > 0) return true;
    if (fromPoint === 'left' && toPoint === 'right' && dx < 0) return true;
    if (fromPoint === 'bottom' && toPoint === 'top' && dy > 0) return true;
    if (fromPoint === 'top' && toPoint === 'bottom' && dy < 0) return true;
    return false;
  };
  
  // Case 1: Both anchors are horizontal (left/right)
  if (isFromHorizontal && isToHorizontal) {
    // Check if they're facing away from each other (optimal simple routing)
    const fromGoingRight = fromPoint === 'right';
    const toGoingRight = toPoint === 'right';
    
    if (fromGoingRight === toGoingRight) {
      // Same direction - use simple 3-segment path
      const midX = x1 + dx / 2;
      return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
    } else if (areFacingEachOther()) {
      // Facing each other optimally - direct path with one turn
      const midX = x1 + dx / 2;
      return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
    } else {
      // Facing towards each other but overlapping - need to go around
      const offset = Math.max(minSegment, Math.abs(dy) / 2 + 20);
      const shouldGoAbove = dy > 0 ? false : true; // Go above if target is above, below if target is below
      const routeY = shouldGoAbove ? Math.min(y1, y2) - offset : Math.max(y1, y2) + offset;
      
      const exitX = x1 + (fromGoingRight ? minSegment : -minSegment);
      const entryX = x2 + (toGoingRight ? minSegment : -minSegment);
      
      return `M ${x1} ${y1} L ${exitX} ${y1} L ${exitX} ${routeY} L ${entryX} ${routeY} L ${entryX} ${y2} L ${x2} ${y2}`;
    }
  }
  
  // Case 2: Both anchors are vertical (top/bottom)
  if (!isFromHorizontal && !isToHorizontal) {
    const fromGoingDown = fromPoint === 'bottom';
    const toGoingDown = toPoint === 'bottom';
    
    if (fromGoingDown === toGoingDown) {
      // Same direction - use simple 3-segment path
      const midY = y1 + dy / 2;
      return `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
    } else if (areFacingEachOther()) {
      // Facing each other optimally - direct path with one turn
      const midY = y1 + dy / 2;
      return `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
    } else {
      // Facing towards each other but overlapping - need to go around
      const offset = Math.max(minSegment, Math.abs(dx) / 2 + 20);
      const shouldGoLeft = dx > 0 ? false : true;
      const routeX = shouldGoLeft ? Math.min(x1, x2) - offset : Math.max(x1, x2) + offset;
      
      const exitY = y1 + (fromGoingDown ? minSegment : -minSegment);
      const entryY = y2 + (toGoingDown ? minSegment : -minSegment);
      
      return `M ${x1} ${y1} L ${x1} ${exitY} L ${routeX} ${exitY} L ${routeX} ${entryY} L ${x2} ${entryY} L ${x2} ${y2}`;
    }
  }
  
  // Case 3: One horizontal, one vertical (most common case)
  if (isFromHorizontal && !isToHorizontal) {
    // From horizontal (left/right), to vertical (top/bottom)
    const fromGoingRight = fromPoint === 'right';
    const toGoingDown = toPoint === 'bottom';
    
    // Check if we can use simple L-shape
    const canUseSimpleL = 
      (fromGoingRight && dx > minSegment) || 
      (!fromGoingRight && dx < -minSegment);
    
    if (canUseSimpleL) {
      // Simple L-shape
      return `M ${x1} ${y1} L ${x2} ${y1} L ${x2} ${y2}`;
    } else {
      // Need to extend and route around
      const extendX = x1 + (fromGoingRight ? minSegment : -minSegment);
      return `M ${x1} ${y1} L ${extendX} ${y1} L ${extendX} ${y2} L ${x2} ${y2}`;
    }
  }
  
  if (!isFromHorizontal && isToHorizontal) {
    // From vertical (top/bottom), to horizontal (left/right)
    const fromGoingDown = fromPoint === 'bottom';
    const toGoingRight = toPoint === 'right';
    
    // Check if we can use simple L-shape
    const canUseSimpleL = 
      (fromGoingDown && dy > minSegment) || 
      (!fromGoingDown && dy < -minSegment);
    
    if (canUseSimpleL) {
      // Simple L-shape
      return `M ${x1} ${y1} L ${x1} ${y2} L ${x2} ${y2}`;
    } else {
      // Need to extend and route around
      const extendY = y1 + (fromGoingDown ? minSegment : -minSegment);
      return `M ${x1} ${y1} L ${x1} ${extendY} L ${x2} ${extendY} L ${x2} ${y2}`;
    }
  }
  
  // Fallback to simple 3-segment path
  const midX = x1 + dx / 2;
  return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
};

/**
 * Main ConnectionRenderer component - renders styled connections between canvas objects
 */
const ConnectionRenderer: React.FC<ConnectionRendererProps> = ({ connections, objects, groupDragState, activeConnectionIndex, onConnectionClick }) => {
  return (
    <>
      {connections.map((conn, index) => {
        // Extract from and to names
        const fromName = typeof conn.from === 'string' ? conn.from : conn.from.name;
        const toName = typeof conn.to === 'string' ? conn.to : conn.to.name;

        // Get anchor positions (with group drag offset applied)
        const fromPos = getAnchorPosition(fromName, conn.fromPoint, objects, groupDragState);
        const toPos = getAnchorPosition(toName, conn.toPoint, objects, groupDragState);

        // Determine connection type and get default styles
        const connectionType = (conn.connectionType as ConnectionType) || ConnectionType.DEFAULT;
        const typeDefinition = getConnectionTypeDefinition(connectionType);
        const defaultStyle = typeDefinition?.defaultStyle || getDefaultStyleForType(ConnectionType.DEFAULT);

        // Merge default styles with custom uidata styles
        const borderColor = conn.uidata?.borderColor || defaultStyle.borderColor;
        const borderThickness = conn.uidata?.borderThickness || defaultStyle.borderThickness;
        const borderStyle = conn.uidata?.borderStyle || defaultStyle.borderStyle;
        const arrowType = conn.uidata?.arrowType || defaultStyle.arrowType;
        const linePattern = conn.uidata?.linePattern || defaultStyle.linePattern;
        const dashArray = getBorderDashArray(borderStyle);

        const angle = getAngle(fromPos.x, fromPos.y, toPos.x, toPos.y);
        const midpoint = getMidpoint(fromPos.x, fromPos.y, toPos.x, toPos.y);

        // Default to orthogonal (90-degree corners) for professional appearance
        const effectiveLinePattern = linePattern || 'orthogonal';

        // Calculate path data based on line pattern (used for highlight and hit area)
        const getPathData = (): string => {
          if (effectiveLinePattern === 'curved') {
            return getSmoothCurvedPath(fromPos.x, fromPos.y, toPos.x, toPos.y);
          }
          if (effectiveLinePattern === 'stepped') {
            return getSteppedPath(fromPos.x, fromPos.y, toPos.x, toPos.y);
          }
          // orthogonal or straight
          return getOrthogonalPath(
            fromPos.x,
            fromPos.y,
            toPos.x,
            toPos.y,
            conn.fromPoint,
            conn.toPoint
          );
        };

        const pathData = getPathData();

        // Render based on arrow type and line pattern
        const renderConnection = () => {
          // Default to orthogonal (90-degree corners) for professional appearance
          const effectiveLinePattern = linePattern || 'orthogonal';
          
          // Handle different line patterns
          if (effectiveLinePattern === 'curved') {
            const pathData = getSmoothCurvedPath(fromPos.x, fromPos.y, toPos.x, toPos.y);
            
            // Render the curved path
            const baseCurve = (
              <Path
                data={pathData}
                stroke={borderColor}
                strokeWidth={borderThickness}
                dash={dashArray}
                opacity={0.8}
              />
            );

            // Add arrow heads based on arrow type
            if (arrowType === 'filled' || arrowType === 'open') {
              return (
                <Group key={`connection-${index}`}>
                  {baseCurve}
                  <Arrow
                    points={[toPos.x - 15, toPos.y, toPos.x, toPos.y]}
                    stroke={borderColor}
                    strokeWidth={borderThickness}
                    fill={arrowType === 'filled' ? borderColor : 'transparent'}
                    pointerLength={10}
                    pointerWidth={10}
                  />
                </Group>
              );
            } else if (arrowType === 'double') {
              return (
                <Group key={`connection-${index}`}>
                  {baseCurve}
                  <Arrow
                    points={[fromPos.x + 15, fromPos.y, fromPos.x, fromPos.y]}
                    stroke={borderColor}
                    strokeWidth={borderThickness}
                    fill={borderColor}
                    pointerLength={10}
                    pointerWidth={10}
                  />
                  <Arrow
                    points={[toPos.x - 15, toPos.y, toPos.x, toPos.y]}
                    stroke={borderColor}
                    strokeWidth={borderThickness}
                    fill={borderColor}
                    pointerLength={10}
                    pointerWidth={10}
                  />
                </Group>
              );
            } else if (arrowType === 'diamond' || arrowType === 'hollow-diamond') {
              return (
                <Group key={`connection-${index}`}>
                  {baseCurve}
                  {renderDiamond(fromPos.x, fromPos.y, angle, arrowType === 'diamond', borderColor)}
                </Group>
              );
            } else if (arrowType === 'hollow-triangle') {
              return (
                <Group key={`connection-${index}`}>
                  {baseCurve}
                  {renderHollowTriangle(toPos.x, toPos.y, angle, borderColor)}
                </Group>
              );
            }
            
            return (
              <Group key={`connection-${index}`}>
                {baseCurve}
              </Group>
            );
          }

          if (effectiveLinePattern === 'stepped') {
            const pathData = getSteppedPath(fromPos.x, fromPos.y, toPos.x, toPos.y);
            return (
              <Group key={`connection-${index}`}>
                <Path
                  data={pathData}
                  stroke={borderColor}
                  strokeWidth={borderThickness}
                  dash={dashArray}
                  opacity={0.8}
                />
                {arrowType === 'filled' && (
                  <Arrow
                    points={[toPos.x - 15, toPos.y, toPos.x, toPos.y]}
                    stroke={borderColor}
                    strokeWidth={borderThickness}
                    fill={borderColor}
                    pointerLength={10}
                    pointerWidth={10}
                  />
                )}
              </Group>
            );
          }

          // Use orthogonal routing (90-degree corners) by default or when explicitly set
          if (effectiveLinePattern === 'orthogonal' || effectiveLinePattern === 'straight') {
            const pathData = getOrthogonalPath(
              fromPos.x, 
              fromPos.y, 
              toPos.x, 
              toPos.y,
              conn.fromPoint,
              conn.toPoint
            );
            
            // Render the orthogonal path
            const basePath = (
              <Path
                data={pathData}
                stroke={borderColor}
                strokeWidth={borderThickness}
                dash={dashArray}
                opacity={0.8}
                lineCap="round"
                lineJoin="round"
              />
            );

            // Calculate arrow direction based on toPoint anchor
            // Arrow should point INTO the target object from outside
            const getArrowPoints = () => {
              const arrowLength = 18;
              const offset = -2; // Position arrow just outside the object boundary to be fully visible
              switch (conn.toPoint) {
                case 'right':
                  // Arrow pointing left (into right side)
                  return [toPos.x + arrowLength - offset, toPos.y, toPos.x - offset, toPos.y];
                case 'left':
                  // Arrow pointing right (into left side)
                  return [toPos.x - arrowLength + offset, toPos.y, toPos.x + offset, toPos.y];
                case 'bottom':
                  // Arrow pointing up (into bottom side)
                  return [toPos.x, toPos.y + arrowLength - offset, toPos.x, toPos.y - offset];
                case 'top':
                  // Arrow pointing down (into top side)
                  return [toPos.x, toPos.y - arrowLength + offset, toPos.x, toPos.y + offset];
                default:
                  return [toPos.x + arrowLength - offset, toPos.y, toPos.x - offset, toPos.y];
              }
            };

            const getStartArrowPoints = () => {
              const arrowLength = 18;
              const offset = -2;
              switch (conn.fromPoint) {
                case 'right':
                  // Arrow pointing right (out of right side)
                  return [fromPos.x - arrowLength + offset, fromPos.y, fromPos.x + offset, fromPos.y];
                case 'left':
                  // Arrow pointing left (out of left side)
                  return [fromPos.x + arrowLength - offset, fromPos.y, fromPos.x - offset, fromPos.y];
                case 'bottom':
                  // Arrow pointing down (out of bottom side)
                  return [fromPos.x, fromPos.y - arrowLength + offset, fromPos.x, fromPos.y + offset];
                case 'top':
                  // Arrow pointing up (out of top side)
                  return [fromPos.x, fromPos.y + arrowLength - offset, fromPos.x, fromPos.y - offset];
                default:
                  return [fromPos.x - arrowLength + offset, fromPos.y, fromPos.x + offset, fromPos.y];
              }
            };

            // Add arrow heads based on arrow type
            if (arrowType === 'filled' || arrowType === 'open') {
              return (
                <Group key={`connection-${index}`}>
                  {basePath}
                  <Arrow
                    points={getArrowPoints()}
                    stroke={borderColor}
                    strokeWidth={borderThickness}
                    fill={arrowType === 'filled' ? borderColor : 'transparent'}
                    pointerLength={12}
                    pointerWidth={12}
                  />
                </Group>
              );
            } else if (arrowType === 'double') {
              return (
                <Group key={`connection-${index}`}>
                  {basePath}
                  <Arrow
                    points={getStartArrowPoints()}
                    stroke={borderColor}
                    strokeWidth={borderThickness}
                    fill={borderColor}
                    pointerLength={12}
                    pointerWidth={12}
                  />
                  <Arrow
                    points={getArrowPoints()}
                    stroke={borderColor}
                    strokeWidth={borderThickness}
                    fill={borderColor}
                    pointerLength={12}
                    pointerWidth={12}
                  />
                </Group>
              );
            } else if (arrowType === 'diamond' || arrowType === 'hollow-diamond') {
              // Calculate angle and offset position based on fromPoint direction for orthogonal paths
              let diamondAngle = 0;
              let diamondX = fromPos.x;
              let diamondY = fromPos.y;
              const diamondOffset = 10; // Offset to position diamond outside the object
              
              switch (conn.fromPoint) {
                case 'right':
                  diamondAngle = Math.PI / 2; // pointing right
                  diamondX += diamondOffset;
                  break;
                case 'left':
                  diamondAngle = -Math.PI / 2; // pointing left
                  diamondX -= diamondOffset;
                  break;
                case 'bottom':
                  diamondAngle = Math.PI; // pointing down
                  diamondY += diamondOffset;
                  break;
                case 'top':
                  diamondAngle = 0; // pointing up
                  diamondY -= diamondOffset;
                  break;
              }
              return (
                <Group key={`connection-${index}`}>
                  {basePath}
                  {renderDiamond(diamondX, diamondY, diamondAngle, arrowType === 'diamond', borderColor)}
                </Group>
              );
            } else if (arrowType === 'hollow-triangle') {
              // Calculate angle and offset position based on toPoint direction for orthogonal paths
              let triangleAngle = 0;
              let triangleX = toPos.x;
              let triangleY = toPos.y;
              const triangleOffset = 2; // Offset to position triangle outside the object
              
              switch (conn.toPoint) {
                case 'right':
                  triangleAngle = -Math.PI / 2; // pointing left (into right side)
                  triangleX += triangleOffset;
                  break;
                case 'left':
                  triangleAngle = Math.PI / 2; // pointing right (into left side)
                  triangleX -= triangleOffset;
                  break;
                case 'bottom':
                  triangleAngle = Math.PI; // pointing up (into bottom side)
                  triangleY += triangleOffset;
                  break;
                case 'top':
                  triangleAngle = Math.PI; // pointing down (into top side)
                  triangleY -= triangleOffset;
                  break;
              }
              return (
                <Group key={`connection-${index}`}>
                  {basePath}
                  {renderHollowTriangle(triangleX, triangleY, triangleAngle, borderColor)}
                </Group>
              );
            }
            
            return (
              <Group key={`connection-${index}`}>
                {basePath}
              </Group>
            );
          }

          // Legacy: Handle different arrow types with straight lines (deprecated)
          switch (arrowType) {
            case 'diamond':
              // Composition: filled diamond at source
              return (
                <Group key={`connection-${index}`}>
                  <Line
                    points={[fromPos.x, fromPos.y, toPos.x, toPos.y]}
                    stroke={borderColor}
                    strokeWidth={borderThickness}
                    dash={dashArray}
                    opacity={0.8}
                  />
                  {renderDiamond(fromPos.x, fromPos.y, angle, true, borderColor)}
                </Group>
              );

            case 'hollow-diamond':
              // Aggregation: hollow diamond at source
              return (
                <Group key={`connection-${index}`}>
                  <Line
                    points={[fromPos.x, fromPos.y, toPos.x, toPos.y]}
                    stroke={borderColor}
                    strokeWidth={borderThickness}
                    dash={dashArray}
                    opacity={0.8}
                  />
                  {renderDiamond(fromPos.x, fromPos.y, angle, false, borderColor)}
                </Group>
              );

            case 'hollow-triangle':
              // Generalization/Inheritance: hollow triangle at target
              return (
                <Group key={`connection-${index}`}>
                  <Line
                    points={[fromPos.x, fromPos.y, toPos.x, toPos.y]}
                    stroke={borderColor}
                    strokeWidth={borderThickness}
                    dash={dashArray}
                    opacity={0.8}
                  />
                  {renderHollowTriangle(toPos.x, toPos.y, angle, borderColor)}
                </Group>
              );

            case 'double':
              // Bidirectional: arrows at both ends
              return renderBidirectionalArrow(
                [fromPos.x, fromPos.y, toPos.x, toPos.y],
                borderColor,
                borderThickness,
                dashArray
              );

            case 'open':
              // Open arrow (not filled)
              return (
                <Arrow
                  key={`connection-${index}`}
                  points={[fromPos.x, fromPos.y, toPos.x, toPos.y]}
                  stroke={borderColor}
                  strokeWidth={borderThickness}
                  fill="transparent"
                  dash={dashArray}
                  opacity={0.8}
                  pointerLength={10}
                  pointerWidth={10}
                />
              );

            case 'filled':
            default:
              // Standard filled arrow
              return (
                <Arrow
                  key={`connection-${index}`}
                  points={[fromPos.x, fromPos.y, toPos.x, toPos.y]}
                  stroke={borderColor}
                  strokeWidth={borderThickness}
                  fill={borderColor}
                  dash={dashArray}
                  opacity={0.8}
                  pointerLength={10}
                  pointerWidth={10}
                />
              );
          }
        };

        const isActive = activeConnectionIndex === index;

        return (
          <Group 
            key={`connection-wrapper-${index}`}
            onClick={() => onConnectionClick?.(index)}
            onTap={() => onConnectionClick?.(index)}
          >
            {/* Selection highlight - thicker path behind the connection following actual shape */}
            {isActive && (
              <Path
                data={pathData}
                stroke="#3B82F6"
                strokeWidth={(borderThickness || 2) + 6}
                opacity={0.4}
                lineCap="round"
                lineJoin="round"
              />
            )}
            {/* Invisible hit area for easier clicking - follows actual path shape */}
            <Path
              data={pathData}
              stroke="transparent"
              strokeWidth={20}
              hitStrokeWidth={20}
            />
            {renderConnection()}
          </Group>
        );
        // // Get connection label (use name field)
        // const connectionLabel = conn.name || '';
        // const labelWidth = connectionLabel.length * 5.5 + 8;
        // const labelHeight = 16;

        // return (
        //   <Group key={`connection-group-${index}`}>
        //     {renderConnection()}
        //     {/* Render connection label at midpoint with background */}
        //     {connectionLabel && (
        //       <Group
        //         x={midpoint.x - labelWidth / 2}
        //         y={midpoint.y - labelHeight / 2 - 4}
        //       >
        //         <Rect
        //           width={labelWidth}
        //           height={labelHeight}
        //           fill="rgba(255, 255, 255, 0.9)"
        //           stroke="#e5e7eb"
        //           strokeWidth={1}
        //           cornerRadius={3}
        //         />
        //         <Text
        //           x={4}
        //           y={3}
        //           text={connectionLabel}
        //           fontSize={10}
        //           fontFamily="Inter, system-ui, sans-serif"
        //           fill="#374151"
        //         />
        //       </Group>
        //     )}
        //   </Group>
        // );
      })}
    </>
  );
};

export default ConnectionRenderer;
