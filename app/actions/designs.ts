"use server";
import { createServer } from "@/lib/supabaseServer";
import { SaveDesignPayload, SaveDesignResponse, Design, DesignsResponse } from "@/types";



/**
 * Server Action: Save a design via the Node.js API
 */
export async function saveDesign(payload: SaveDesignPayload, id: string, accessToken?: string): Promise<SaveDesignResponse> {
  // Optionally use accessToken to initialize Supabase server client if needed
  // const supabase = createServer(accessToken); // If your createServer supports token injection
  // If not, you can skip session check here, since token is passed from frontend

  if (!accessToken) {
    return { success: false, error: 'Unauthorized: No access token provided.' };
  }

  const apiUrl = process.env.DESIGN_SERVICE_URL || 'http://design-service:3000';
  if (!id) {
    console.error('Design ID is missing in payload:', payload);
    return { success: false, error: 'Design ID is required for saving.' };
  }

  try {
    console.log('Saving design ' + id + ' with payload:', payload.data);
    const response = await fetch(`${apiUrl}/api/v1/designs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return { success: false, error: `API error on saveDesign: ${response.status} ${response.statusText}` };
    }

    const data = await response.json();
    console.log('Design saved successfully:', data);
    return { success: true, id: data.id };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Unknown error' };
  }
}


/**
 * Fetch all designs from the API
 * 
 * TODO: Replace with real API call when deployed
 * Real endpoint: http://www.nighutlabs.com/api/v1/designs
 */
export async function getDesigns(accessToken?: string): Promise<DesignsResponse> {
  // const supabase = createServer();
  // const { data: { session }} = await supabase.auth.getSession();

  // if (!session) {
  //   return { success: false, data:[], total: 0, error: 'User not authenticated' };
  // }

  try {
    // Use the Node.js service URL for fetching designs
    const apiUrl = process.env.DESIGN_SERVICE_URL || 'http://localhost:3000';
    const response = await fetch(`${apiUrl}/api/v1/designs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();

    console.log('Fetched designs:', data);
    return {
      success: true,
      data: data.designs || data,
      total: data.total || (Array.isArray(data.designs) ? data.designs.length : Array.isArray(data) ? data.length : 0)
    };
  } catch (error) {
    console.error('Error fetching designs:', process.env.DESIGN_SERVICE_URL, error);
    return {
      success: false,
      data: [],
      total: 0,
      error: error instanceof Error ? error.message : 'Failed to fetch designs'
    };
  }
}

/**
 * Server Action: Fetch a single design by ID from the Node.js API
 */
export async function getDesign(id: string, accessToken?: string): Promise<{ success: boolean; data?: Design; error?: string }> {
  const apiUrl = process.env.DESIGN_SERVICE_URL || 'http://design-service:3000';
  try {
    const response = await fetch(`${apiUrl}/api/v1/designs/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
      },
      cache: 'no-store',
    });
    if (!response.ok) {
      return { success: false, error: `API error on getDesign: ${response.status} ${response.statusText}` };
    }
    const data = await response.json();
    console.log('Fetched design:', data);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Unknown error' };
  }
}

/**
 * Delete a design by ID with accessToken for authorization
 */
export async function deleteDesign(designId: string, accessToken?: string): Promise<{ success: boolean; error?: string }> {
  if (!accessToken) {
    return { success: false, error: 'Unauthorized: No access token provided.' };
  }
  try {
    const apiUrl = process.env.DESIGN_SERVICE_URL || 'http://design-service:3000';
    const response = await fetch(`${apiUrl}/api/v1/designs/${designId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete design: ${response.status} ${response.statusText}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting design:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete design'
    };
  }
}
