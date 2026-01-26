// Placeholder for design service API

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
 * Mock saveDesign API - simulates a 200ms delay
 */
export async function saveDesign(payload: SaveDesignPayload): Promise<SaveDesignResponse> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));
  // Return mock response
  return {
    success: true,
    id: payload.id || Math.random().toString(36).substr(2, 9),
  };
}
