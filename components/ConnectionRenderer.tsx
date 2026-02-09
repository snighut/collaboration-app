import React from 'react';
import { Line, Arrow } from 'react-konva';
import { Connection, CanvasObject } from '../types';

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
 * ConnectionRenderer component - renders styled connections between canvas objects
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

        // Get styling from uidata
        const borderColor = conn.uidata?.borderColor || '#3B82F6';
        const borderThickness = conn.uidata?.borderThickness || 2;
        const borderStyle = conn.uidata?.borderStyle || 'solid';
        const dashArray = getBorderDashArray(borderStyle);

        // Determine if this should be an arrow (if toPoint suggests directionality)
        // You can customize this logic based on your needs
        const isArrow = true; // For now, all connections are arrows

        if (isArrow) {
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
        } else {
          return (
            <Line
              key={`connection-${index}`}
              points={[fromPos.x, fromPos.y, toPos.x, toPos.y]}
              stroke={borderColor}
              strokeWidth={borderThickness}
              dash={dashArray}
              opacity={0.8}
            />
          );
        }
      })}
    </>
  );
};

export default ConnectionRenderer;
