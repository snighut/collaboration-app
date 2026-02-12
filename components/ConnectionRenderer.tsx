import React from 'react';
import { Line, Arrow, Circle, Group, Path } from 'react-konva';
import { Connection, CanvasObject } from '../types';
import { ConnectionType, getConnectionTypeDefinition, getDefaultStyleForType } from '../lib/connectionTypes';

interface ConnectionRendererProps {
  connections: Connection[];
  objects: CanvasObject[];
}

/**
 * Helper function to get anchor position based on object and anchor point
 */
const getAnchorPosition = (
  objName: string,
  position: string,
  objects: CanvasObject[]
): { x: number; y: number } => {
  const obj = objects.find(o => o.name === objName);
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
 * Generate curved path points
 */
const getCurvedPath = (x1: number, y1: number, x2: number, y2: number): string => {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const curvature = distance * 0.2;
  
  // Control point perpendicular to the line
  const controlX = midX - dy / distance * curvature;
  const controlY = midY + dx / distance * curvature;
  
  return `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`;
};

/**
 * Generate stepped path points (for message queues)
 */
const getSteppedPath = (x1: number, y1: number, x2: number, y2: number): string => {
  const midX = (x1 + x2) / 2;
  return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
};

/**
 * Main ConnectionRenderer component - renders styled connections between canvas objects
 */
const ConnectionRenderer: React.FC<ConnectionRendererProps> = ({ connections, objects }) => {
  return (
    <>
      {connections.map((conn, index) => {
        // Extract from and to names
        const fromName = typeof conn.from === 'string' ? conn.from : conn.from.name;
        const toName = typeof conn.to === 'string' ? conn.to : conn.to.name;

        // Get anchor positions
        const fromPos = getAnchorPosition(fromName, conn.fromPoint, objects);
        const toPos = getAnchorPosition(toName, conn.toPoint, objects);

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

        // Render based on arrow type and line pattern
        const renderConnection = () => {
          // Handle different line patterns
          if (linePattern === 'curved') {
            const pathData = getCurvedPath(fromPos.x, fromPos.y, toPos.x, toPos.y);
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

          if (linePattern === 'stepped') {
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

          // Handle different arrow types with straight lines
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

        return renderConnection();
      })}
    </>
  );
};

export default ConnectionRenderer;
