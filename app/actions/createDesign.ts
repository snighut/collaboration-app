"use server";

import type { SaveDesignPayload, SaveDesignResponse } from '../../types';

/**
 * Server Action: Create a new design via the Node.js API (POST)
 */
export async function createDesign(payload: SaveDesignPayload, accessToken?: string): Promise<SaveDesignResponse> {
  if (!accessToken) {
    return { success: false, error: 'Unauthorized: No access token provided.' };
  }

  const apiUrl = process.env.DESIGN_SERVICE_URL || 'http://design-service:3000';

  try {
    const response = await fetch(`${apiUrl}/api/v1/designs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return { success: false, error: `API error on createDesign: ${response.status} ${response.statusText}` };
    }

    const data = await response.json();
    return { success: true, id: data.id };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Unknown error' };
  }
}