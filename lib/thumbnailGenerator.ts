/**
 * Utility functions for generating thumbnails from Konva canvas
 */

import Konva from 'konva';

export interface ThumbnailOptions {
  width?: number;
  height?: number;
  quality?: number;
  mimeType?: string;
}

/**
 * Generates a thumbnail blob from a Konva Stage
 * @param stage - The Konva Stage to capture
 * @param options - Optional thumbnail configuration
 * @returns Promise<Blob> - The generated thumbnail as a Blob
 */
export async function generateThumbnailFromStage(
  stage: Konva.Stage,
  options: ThumbnailOptions = {}
): Promise<Blob> {
  const {
    width = 400,
    height = 300,
    quality = 0.8,
    mimeType = 'image/jpeg',
  } = options;

  // Get the current stage dimensions
  const stageWidth = stage.width();
  const stageHeight = stage.height();

  // Guard against 0 dimensions which would cause drawImage to fail
  if (stageWidth <= 0 || stageHeight <= 0) {
    // Return an empty transparent 1x1 pixel blob as fallback
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob || new Blob()), mimeType, quality);
    });
  }

  // Calculate scale to fit thumbnail dimensions while maintaining aspect ratio
  const scale = Math.min(width / stageWidth, height / stageHeight);

  // Create a data URL with the scaled dimensions
  const dataUrl = stage.toDataURL({
    mimeType,
    quality,
    pixelRatio: scale,
  });

  // Convert data URL to Blob
  const blob = await dataUrlToBlob(dataUrl);
  return blob;
}

/**
 * Converts a data URL to a Blob
 * @param dataUrl - The data URL to convert
 * @returns Promise<Blob> - The converted Blob
 */
export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return blob;
}

/**
 * Converts a Blob to a File object
 * @param blob - The blob to convert
 * @param fileName - The name for the file
 * @returns File
 */
export function blobToFile(blob: Blob, fileName: string): File {
  return new File([blob], fileName, { type: blob.type });
}
