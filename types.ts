
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
