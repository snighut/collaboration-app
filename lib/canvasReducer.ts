// lib/canvasReducer.ts

import { CanvasObject } from '../types';

export interface CanvasState {
  id?: string;
  name: string;
  description: string;
  thumbnail: string | null;
  objects: CanvasObject[];
  connections: Array<{ from: string; to: string; fromPoint: string; toPoint: string }>;
}

export type CanvasAction =
  | { type: 'SET_STATE'; payload: Partial<CanvasState> }
  | { type: 'ADD_OBJECT'; payload: CanvasObject }
  | { type: 'UPDATE_OBJECT'; id: string; updates: Partial<CanvasObject> }
  | { type: 'REMOVE_OBJECT'; id: string }
  | { type: 'ADD_CONNECTION'; payload: { from: string; to: string; fromPoint: string; toPoint: string } }
  | { type: 'REMOVE_CONNECTION'; id: string }
  | { type: 'RESET'; };

export function canvasReducer(state: CanvasState, action: CanvasAction): CanvasState {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, ...action.payload };
    case 'ADD_OBJECT':
      return { ...state, objects: [...state.objects, action.payload] };
    case 'UPDATE_OBJECT':
      return {
        ...state,
        objects: state.objects.map(obj => obj.id === action.id ? { ...obj, ...action.updates } : obj)
      };
    case 'REMOVE_OBJECT':
      return {
        ...state,
        objects: state.objects.filter(obj => obj.id !== action.id),
        connections: state.connections.filter(conn => conn.from !== action.id && conn.to !== action.id)
      };
    case 'ADD_CONNECTION':
      return { ...state, connections: [...state.connections, action.payload] };
    case 'REMOVE_CONNECTION':
      return { ...state, connections: state.connections.filter((_, idx) => idx !== Number(action.id)) };
    case 'RESET':
      return {
        name: '',
        description: '',
        thumbnail: null,
        objects: [],
        connections: [],
      };
    default:
      return state;
  }
}
