// Design entity and response contracts
export interface Design {
  connections: Connection[];
  description: string;
  items: DesignItem[];
  id: string;
  name: string;
  thumbnail?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  data: any; // JSON context
  context?: DesignContext;
  designGroups?: DesignGroup[];
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
  description?: string;
  thumbnail?: string;
  context?: DesignContext;
  items: DesignItem[];
  connections: Connection[];
  designGroups?: DesignGroup[];
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

// New schema types for updated design structure

export interface DesignContext {
  category?: string;
  tags?: string[];
}

export interface UIData {
  type?: AssetType;
  x?: number;
  y?: number;
  content?: string;
  zIndex?: number;
  width?: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderThickness?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  fontSize?: number;
  fontStyle?: string;
}

export interface DesignItem {
  id: string;
  name: string;
  uidata: UIData;
}

export interface ConnectionReference {
  name: string;
  type: 'DesignItem' | 'DesignGroup';
}

export interface Connection {
  name?: string;
  from: string | ConnectionReference;
  to: string | ConnectionReference;
  fromPoint: string;
  toPoint: string;
  uidata?: {
    borderColor?: string;
    borderThickness?: number;
    borderStyle?: 'solid' | 'dashed' | 'dotted';
  };
}

export interface DesignGroup {
  id: string;
  name: string;
  description?: string;
  uidata?: {
    x?: number;
    y?: number;
    borderColor?: string;
    borderThickness?: number;
    borderStyle?: 'solid' | 'dashed' | 'dotted';
  };
  designs?: any[];
}

// Legacy CanvasObject interface for backward compatibility
export interface CanvasObject {
  name: string;
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
  connectedTo?: string; // name of object this is connected to
  connectionPoints?: { name: string; x: number; y: number }[]; // Connection anchor points
}

export interface YearRange {
  start: number;
  end: number;
}
