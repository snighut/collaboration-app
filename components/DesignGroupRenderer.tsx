import React from 'react';
import { Rect, Text as KonvaText, Group } from 'react-konva';
import { DesignGroup, CanvasObject } from '../types';

interface DesignGroupRendererProps {
  designGroups: DesignGroup[];
  objects: CanvasObject[];
  onSelect?: (groupId: string) => void;
  activeGroupId?: string | null;
}

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

  // For now, we'll use a default size if no objects are associated
  // In a more complete implementation, you'd track which objects belong to which group
  const defaultWidth = 200;
  const defaultHeight = 150;

  return {
    x: baseX,
    y: baseY,
    width: defaultWidth,
    height: defaultHeight,
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
}) => {
  return (
    <>
      {designGroups.map((group) => {
        const bounds = calculateGroupBounds(group, objects);
        const borderColor = group.uidata?.borderColor || '#4CAF50';
        const borderThickness = group.uidata?.borderThickness || 2;
        const borderStyle = group.uidata?.borderStyle || 'dashed';
        const dashArray = getBorderDashArray(borderStyle);
        const isActive = activeGroupId === group.id;

        return (
          <Group key={`group-${group.id}`}>
            {/* Group boundary rectangle */}
            <Rect
              x={bounds.x}
              y={bounds.y}
              width={bounds.width}
              height={bounds.height}
              stroke={borderColor}
              strokeWidth={isActive ? borderThickness + 1 : borderThickness}
              dash={dashArray}
              fill="transparent"
              opacity={isActive ? 0.9 : 0.6}
              cornerRadius={8}
              onClick={() => onSelect && onSelect(group.id)}
              onTap={() => onSelect && onSelect(group.id)}
            />

            {/* Group label */}
            <Rect
              x={bounds.x + 10}
              y={bounds.y - 12}
              width={group.name.length * 8 + 16}
              height={20}
              fill={borderColor}
              cornerRadius={4}
              opacity={0.9}
            />
            <KonvaText
              x={bounds.x + 18}
              y={bounds.y - 8}
              text={group.name}
              fontSize={12}
              fontStyle="bold"
              fill="white"
            />

            {/* Optional description tooltip area */}
            {group.description && isActive && (
              <>
                <Rect
                  x={bounds.x + 10}
                  y={bounds.y + bounds.height - 30}
                  width={Math.min(bounds.width - 20, 200)}
                  height={25}
                  fill={borderColor}
                  cornerRadius={4}
                  opacity={0.8}
                />
                <KonvaText
                  x={bounds.x + 16}
                  y={bounds.y + bounds.height - 26}
                  text={group.description}
                  fontSize={10}
                  fill="white"
                  width={Math.min(bounds.width - 32, 188)}
                  ellipsis={true}
                />
              </>
            )}
          </Group>
        );
      })}
    </>
  );
};

export default DesignGroupRenderer;
