"use server";
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
export async function saveDesign(payload: SaveDesignPayload): Promise<SaveDesignResponse> {
  const apiUrl = process.env.DESIGN_SERVICE_URL || 'http://design-service:3000';

  if (!payload.id) {
    return { success: false, error: 'Design ID is required for saving.' };
  }

  try {
    const response = await fetch(`${apiUrl}/api/v1/designs/${payload.id}`, {
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

// Mock data - remove this when real API is ready
const MOCK_DESIGNS: Design[] = [
  {
    id: '1',
    name: 'User Auth Flow → PostgreSQL',
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z',
    data: { type: 'data-flow', status: 'active' }
  },
  {
    id: '2',
    name: 'Microservices Architecture',
    thumbnail: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-22T12:00:00Z',
    data: { type: 'architecture', status: 'in-progress' }
  },
  {
    id: '3',
    name: 'API Gateway Design',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    createdAt: '2024-01-05T09:00:00Z',
    updatedAt: '2024-01-18T14:00:00Z',
    data: { type: 'system-design', status: 'completed' }
  },
  {
    id: '4',
    name: 'Nginx → Node.js → Redis',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop',
    createdAt: '2024-01-12T11:00:00Z',
    updatedAt: '2024-01-19T16:00:00Z',
    data: { type: 'infrastructure', status: 'active' }
  },
  {
    id: '5',
    name: 'Event-Driven Pipeline',
    thumbnail: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&h=300&fit=crop',
    createdAt: '2024-01-08T07:00:00Z',
    updatedAt: '2024-01-21T13:00:00Z',
    data: { type: 'data-pipeline', status: 'in-progress' }
  },
  {
    id: '6',
    name: 'Database Cluster Topology',
    thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&h=300&fit=crop',
    createdAt: '2024-01-03T10:00:00Z',
    updatedAt: '2024-01-17T11:00:00Z',
    data: { type: 'database', status: 'completed' }
  },
  {
    id: '7',
    name: 'Analytics Dashboard Schema',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
    createdAt: '2024-01-14T09:00:00Z',
    updatedAt: '2024-01-23T10:00:00Z',
    data: { type: 'data-model', status: 'active' }
  },
  {
    id: '8',
    name: 'Kubernetes Deployment',
    thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=400&h=300&fit=crop',
    createdAt: '2024-01-06T08:00:00Z',
    updatedAt: '2024-01-16T12:00:00Z',
    data: { type: 'devops', status: 'completed' }
  },
  {
    id: '9',
    name: 'CI/CD Pipeline Flow',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
    createdAt: '2024-01-11T10:00:00Z',
    updatedAt: '2024-01-24T09:00:00Z',
    data: { type: 'devops', status: 'in-progress' }
  },
  {
    id: '10',
    name: 'Payment Gateway Integration',
    thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=300&fit=crop',
    createdAt: '2024-01-09T11:00:00Z',
    updatedAt: '2024-01-22T14:00:00Z',
    data: { type: 'integration', status: 'active' }
  },
  {
    id: '11',
    name: 'Message Queue Architecture',
    thumbnail: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400&h=300&fit=crop',
    createdAt: '2024-01-07T12:00:00Z',
    updatedAt: '2024-01-20T16:00:00Z',
    data: { type: 'messaging', status: 'in-progress' }
  },
  {
    id: '12',
    name: 'Load Balancer Setup',
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop',
    createdAt: '2024-01-13T13:00:00Z',
    updatedAt: '2024-01-23T15:00:00Z',
    data: { type: 'infrastructure', status: 'active' }
  },
  {
    id: '13',
    name: 'Service Mesh Diagram',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop',
    createdAt: '2024-01-04T14:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    data: { type: 'networking', status: 'completed' }
  },
];

/**
 * Fetch all designs from the API
 * 
 * TODO: Replace with real API call when deployed
 * Real endpoint: http://www.nighutlabs.com/api/v1/designs
 */
export async function getDesigns(): Promise<DesignsResponse> {
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

    console.log('Fetched designs:', data);
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
