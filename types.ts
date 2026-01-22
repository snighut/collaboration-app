
export type AssetType = 'text' | 'image' | 'svg' | 'color';

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
  zIndex: number;
  borderColor?: string;
  borderWidth?: number;
}

export interface YearRange {
  start: number;
  end: number;
}
