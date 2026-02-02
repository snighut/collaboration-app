"use server";
import { createServer } from "@/lib/supabaseServer";

// Types for saving a design
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

/**
 * Server Action: Save a design via the Node.js API
 */
export async function saveDesign(payload: SaveDesignPayload, id: string): Promise<SaveDesignResponse> {
  const supabase = createServer();
  const { data: { session }} = await supabase.auth.getSession();

  if (!session) {
    return { success: false, error: 'Unauthorized: You must be logged in to save a design.' };
  }

  const apiUrl = process.env.DESIGN_SERVICE_URL || 'http://design-service:3000';

  if (!id) {
    return { success: false, error: 'Design ID is required for saving.' };
  }

  try {
    const response = await fetch(`${apiUrl}/api/v1/designs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return { success: false, error: `API error: ${response.status} ${response.statusText}` };
    }

    const data = await response.json();
    return { success: true, id: data.id };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Unknown error' };
  }
}


export interface Design {
  connections(connections: any): unknown;
  description: string;
  items(items: any): unknown;
  id: string;
  name: string;
  thumbnail?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  data: any; // JSON context
}

interface DesignsResponse {
  success: boolean;
  data: Design[];
  total: number;
  error?: string;
}


/**
 * Fetch all designs from the API
 * 
 * TODO: Replace with real API call when deployed
 * Real endpoint: http://www.nighutlabs.com/api/v1/designs
 */
export async function getDesigns(): Promise<DesignsResponse> {
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
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: true,
      data: data.designs || data,
      total: data.total || (Array.isArray(data.designs) ? data.designs.length : Array.isArray(data) ? data.length : 0)
    };
  } catch (error) {
    console.error('Error fetching designs:', error);
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
export async function getDesign(id: string): Promise<{ success: boolean; data?: Design; error?: string }> {
  const apiUrl = process.env.DESIGN_SERVICE_URL || 'http://design-service:3000';
  try {
    const response = await fetch(`${apiUrl}/api/v1/designs/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) {
      return { success: false, error: `API error: ${response.status} ${response.statusText}` };
    }
    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Unknown error' };
  }
}

/**
 * Delete a design by ID
 * 
 * TODO: Replace with real API call when deployed
 * Real endpoint: DELETE http://www.nighutlabs.com/api/v1/designs/{id}
 */
export async function deleteDesign(designId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // TODO: Uncomment when real API is ready
    // const apiUrl = process.env.NIGHUTLABS_API_URL || 'http://www.nighutlabs.com/api/v1';
    // const response = await fetch(`${apiUrl}/designs/${designId}`, {
    //   method: 'DELETE',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    // });
    // 
    // if (!response.ok) {
    //   throw new Error(`Failed to delete design: ${response.statusText}`);
    // }
    // 
    // return { success: true };

    // MOCK: Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // MOCK: Simulate successful deletion
    return { success: true };

  } catch (error) {
    console.error('Error deleting design:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete design'
    };
  }
}
