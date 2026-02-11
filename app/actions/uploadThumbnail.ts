"use server";

/**
 * Server Action: Upload thumbnail for a design
 */
export async function uploadThumbnail(
  designId: string,
  thumbnailData: string,
  accessToken?: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  if (!accessToken) {
    return { success: false, error: 'Unauthorized: No access token provided.' };
  }

  const apiUrl = process.env.DESIGN_SERVICE_URL || 'http://design-service:3000';

  try {
    const response = await fetch(`${apiUrl}/api/v1/designs/${designId}/thumbnail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ thumbnail: thumbnailData }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `API error: ${response.status} ${response.statusText}`,
      };
    }

    const data = await response.json();
    console.log('Thumbnail uploaded successfully:', data);
    return { success: true, url: data.url };
  } catch (error: any) {
    console.error('Error uploading thumbnail:', error);
    return { success: false, error: error?.message || 'Unknown error' };
  }
}
