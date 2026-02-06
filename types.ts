// Design entity and response contracts
export interface Design {
  connections: Array<{ from: string; to: string; fromPoint: string; toPoint: string }>;
  description: string;
  items: CanvasObject[];
  id: string;
  name: string;
  thumbnail?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  data: any; // JSON context
}

export interface DesignsResponse {
  success: boolean;
  data: Design[];
  total: number;
  error?: string;
}
// Design API contracts
export interface SaveDesignPayload {
  id?: string;
  name: string;
  data: any;
}

export interface SaveDesignResponse {
  success: boolean;
  id?: string;
  error?: string;
}

export type AssetType = 'text' | 'image' | 'svg' | 'color' | 'line' | 'arrow' | 'circle' | 'rectangle' | 'triangle';

export interface Achievement {
  id: string;
  year: number;
  title: string;
  description: string;
  category: 'Academic' | 'Professional' | 'Internship' | 'Innovation';
  logoUrl?: string;
}

export interface CanvasObject {
  id: string;
  type: AssetType;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string; // text, url, or svg path
  color?: string;
  backgroundColor?: string;
  zIndex: number;
  borderColor?: string;
  borderWidth?: number;
  cursorPosition?: number;
  fontSize?: number;
  fontStyle?: string;
  strokeDashArray?: number[]; // For dotted/dashed lines
  points?: number[]; // For lines and arrows [x1, y1, x2, y2]
  connectedTo?: string; // ID of object this is connected to
  connectionPoints?: { id: string; x: number; y: number }[]; // Connection anchor points
}

export interface YearRange {
  start: number;
  end: number;
}
