/**
 * Schema transformation utilities
 * Converts between new backend schema (with uidata) and legacy canvas format
 */

import { CanvasObject, DesignItem, Connection, ConnectionReference, DesignGroup } from '../types';

/**
 * Convert DesignItem (new schema) to CanvasObject (legacy format)
 */
export function designItemToCanvasObject(item: DesignItem): CanvasObject {
  const uidata = item.uidata;
  
  return {
    name: item.name,
    type: uidata.type || 'text',
    x: uidata.x || 0,
    y: uidata.y || 0,
    width: uidata.width || 100,
    height: uidata.height || 100,
    content: uidata.content || '',
    color: uidata.color,
    backgroundColor: uidata.backgroundColor,
    zIndex: uidata.zIndex || 1,
    borderColor: uidata.borderColor,
    borderWidth: uidata.borderThickness,
    fontSize: uidata.fontSize,
    fontStyle: uidata.fontStyle,
  };
}

/**
 * Convert CanvasObject (legacy format) to DesignItem (new schema)
 */
export function canvasObjectToDesignItem(obj: CanvasObject): DesignItem {
  return {
    id: `temp-${obj.name}`,
    name: obj.name,
    uidata: {
      type: obj.type,
      x: obj.x,
      y: obj.y,
      width: obj.width,
      height: obj.height,
      content: obj.content,
      zIndex: obj.zIndex,
      color: obj.color,
      backgroundColor: obj.backgroundColor,
      borderColor: obj.borderColor,
      borderThickness: obj.borderWidth,
      fontSize: obj.fontSize,
      fontStyle: obj.fontStyle,
    },
  };
}

/**
 * Normalize connection to ensure from/to are strings
 */
export function normalizeConnection(conn: Connection): Connection {
  const fromName = typeof conn.from === 'string' ? conn.from : conn.from.name;
  const toName = typeof conn.to === 'string' ? conn.to : conn.to.name;

  return {
    ...conn,
    from: fromName,
    to: toName,
    connectionType: conn.connectionType, // Preserve connection type
    connectionData: conn.connectionData, // Preserve connection metadata
  };
}

/**
 * Convert connection to new schema format with ConnectionReference
 */
export function connectionToNewSchema(conn: Connection): Connection {
  const fromName = typeof conn.from === 'string' ? conn.from : conn.from.name;
  const toName = typeof conn.to === 'string' ? conn.to : conn.to.name;

  return {
    name: conn.name || `${fromName} → ${toName}`,
    connectionType: conn.connectionType, // Preserve connection type
    connectionData: conn.connectionData, // Preserve connection metadata
    from: { name: fromName, type: 'DesignItem' },
    to: { name: toName, type: 'DesignItem' },
    fromPoint: conn.fromPoint,
    toPoint: conn.toPoint,
    uidata: conn.uidata || {
      borderColor: '#333333',
      borderThickness: 2,
      borderStyle: 'solid',
    },
  };
}

/**
 * Transform entire design data for saving to backend (new schema format)
 */
export function transformToBackendSchema(data: {
  name: string;
  description: string;
  thumbnail: string | null;
  objects: CanvasObject[];
  connections: Connection[];
  designGroups?: DesignGroup[];
}) {
  return {
    name: data.name,
    description: data.description,
    thumbnail: data.thumbnail,
    context: {
      category: 'general',
      tags: [],
    },
    items: data.objects.map(canvasObjectToDesignItem),
    connections: data.connections.map(connectionToNewSchema),
    designGroups: data.designGroups || [],
  };
}

/**
 * Transform backend data to canvas state (legacy format for compatibility)
 */
export function transformFromBackendSchema(backendData: any): {
  objects: CanvasObject[];
  connections: Connection[];
  designGroups: DesignGroup[];
} {
  // Handle items array (new schema)
  let objects: CanvasObject[] = [];
  if (Array.isArray(backendData.items)) {
    objects = backendData.items.map(designItemToCanvasObject);
  } else if (Array.isArray(backendData.data?.objects)) {
    // Fallback to legacy data.objects
    objects = backendData.data.objects;
  }

  // Handle connections
  let connections: Connection[] = [];
  if (Array.isArray(backendData.connections)) {
    connections = backendData.connections.map(normalizeConnection);
  } else if (Array.isArray(backendData.data?.connections)) {
    connections = backendData.data.connections.map(normalizeConnection);
  }

  // Handle design groups
  let designGroups: DesignGroup[] = [];
  if (Array.isArray(backendData.designGroups)) {
    designGroups = backendData.designGroups;
  } else if (Array.isArray(backendData.data?.designGroups)) {
    designGroups = backendData.data.designGroups;
  }

  return { objects, connections, designGroups };
}
