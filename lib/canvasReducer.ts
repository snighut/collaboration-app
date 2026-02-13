// lib/canvasReducer.ts

import { CanvasObject, Connection, DesignGroup } from '../types';

export interface CanvasState {
  id?: string;
  name: string;
  description: string;
  thumbnail: string | null;
  objects: CanvasObject[];
  connections: Connection[];
  designGroups: DesignGroup[];
  x: number;
  y: number;
}

/**
 * Helper to determine which objects are within a design group's bounds
 * An object is considered "in" a group if its center point falls within the group's boundaries
 */
export function getObjectsInGroup(
  group: DesignGroup,
  objects: CanvasObject[],
  groupWidth: number = 200,
  groupHeight: number = 150
): CanvasObject[] {
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
}

export type CanvasAction =
  | { type: 'SET_STATE'; payload: Partial<CanvasState> }
  | { type: 'UPDATE_STAGE'; payload: { x: number; y: number } }
  | { type: 'ADD_OBJECT'; payload: CanvasObject }
  | { type: 'UPDATE_OBJECT'; name: string; updates: Partial<CanvasObject> }
  | { type: 'REMOVE_OBJECT'; name: string }
  | { type: 'ADD_CONNECTION'; payload: Connection }
  | { type: 'UPDATE_CONNECTION'; name: string; updates: Partial<Connection> }
  | { type: 'REMOVE_CONNECTION'; id: string }
  | { type: 'ADD_DESIGN_GROUP'; payload: DesignGroup }
  | { type: 'UPDATE_DESIGN_GROUP'; id: string; updates: Partial<DesignGroup> }
  | { type: 'REMOVE_DESIGN_GROUP'; id: string }
  | { type: 'DRAG_DESIGN_GROUP'; id: string; deltaX: number; deltaY: number; objectNames: string[] }
  | { type: 'RESET'; };

export function canvasReducer(state: CanvasState, action: CanvasAction): CanvasState {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, ...action.payload };
    case 'UPDATE_STAGE':
      return { ...state, x: action.payload.x, y: action.payload.y };
    case 'ADD_OBJECT':
      return { ...state, objects: [...state.objects, action.payload] };
    case 'UPDATE_OBJECT':
      return {
        ...state,
        objects: state.objects.map(obj => obj.name === action.name ? { ...obj, ...action.updates } : obj)
      };
    case 'REMOVE_OBJECT':
      return {
        ...state,
        objects: state.objects.filter(obj => obj.name !== action.name),
        connections: state.connections.filter(conn => {
          const fromName = typeof conn.from === 'string' ? conn.from : conn.from.name;
          const toName = typeof conn.to === 'string' ? conn.to : conn.to.name;
          return fromName !== action.name && toName !== action.name;
        })
      };
    case 'ADD_CONNECTION':
      return { ...state, connections: [...state.connections, action.payload] };
    case 'UPDATE_CONNECTION':
      return {
        ...state,
        connections: state.connections.map(conn => 
          conn.name === action.name ? { ...conn, ...action.updates } : conn
        )
      };
    case 'REMOVE_CONNECTION':
      return { ...state, connections: state.connections.filter((_, idx) => idx !== Number(action.id)) };
    case 'ADD_DESIGN_GROUP':
      return { ...state, designGroups: [...state.designGroups, action.payload] };
    case 'UPDATE_DESIGN_GROUP':
      return {
        ...state,
        designGroups: state.designGroups.map(group => 
          group.id === action.id ? { ...group, ...action.updates } : group
        )
      };
    case 'REMOVE_DESIGN_GROUP':
      return {
        ...state,
        designGroups: state.designGroups.filter(group => group.id !== action.id)
      };
    case 'DRAG_DESIGN_GROUP': {
      // Move the design group and all objects within it by the delta amount
      const { id, deltaX, deltaY, objectNames } = action;
      
      return {
        ...state,
        // Update design group position
        designGroups: state.designGroups.map(group => {
          if (group.id !== id) return group;
          return {
            ...group,
            uidata: {
              ...group.uidata,
              x: (group.uidata?.x || 0) + deltaX,
              y: (group.uidata?.y || 0) + deltaY,
            }
          };
        }),
        // Update positions of all objects that belong to this group
        objects: state.objects.map(obj => {
          if (!objectNames.includes(obj.name)) return obj;
          return {
            ...obj,
            x: obj.x + deltaX,
            y: obj.y + deltaY,
          };
        }),
      };
    }
    case 'RESET':
      return {
        name: '',
        description: '',
        thumbnail: null,
        objects: [],
        connections: [],
        designGroups: [],
        x: 0,
        y: 0,
      };
    default:
      return state;
  }
}
