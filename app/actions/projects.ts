'use server'

export interface Project {
  id: string;
  name: string;
  thumbnail?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  data: any; // JSON context
}

interface ProjectsResponse {
  success: boolean;
  data: Project[];
  total: number;
  error?: string;
}

// Mock data - remove this when real API is ready
const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'E-Commerce Dashboard',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z',
    data: { type: 'dashboard', status: 'active' }
  },
  {
    id: '2',
    name: 'Mobile App Design',
    thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-22T12:00:00Z',
    data: { type: 'design', status: 'in-progress' }
  },
  {
    id: '3',
    name: 'Marketing Website',
    createdAt: '2024-01-05T09:00:00Z',
    updatedAt: '2024-01-18T14:00:00Z',
    data: { type: 'website', status: 'completed' }
  },
  {
    id: '4',
    name: 'Social Media Campaign',
    thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop',
    createdAt: '2024-01-12T11:00:00Z',
    updatedAt: '2024-01-19T16:00:00Z',
    data: { type: 'marketing', status: 'active' }
  },
  {
    id: '5',
    name: 'API Documentation',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop',
    createdAt: '2024-01-08T07:00:00Z',
    updatedAt: '2024-01-21T13:00:00Z',
    data: { type: 'documentation', status: 'in-progress' }
  },
  {
    id: '6',
    name: 'Brand Identity',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
    createdAt: '2024-01-03T10:00:00Z',
    updatedAt: '2024-01-17T11:00:00Z',
    data: { type: 'design', status: 'completed' }
  },
  {
    id: '7',
    name: 'Analytics Platform',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    createdAt: '2024-01-14T09:00:00Z',
    updatedAt: '2024-01-23T10:00:00Z',
    data: { type: 'dashboard', status: 'active' }
  },
  {
    id: '8',
    name: 'User Research',
    createdAt: '2024-01-06T08:00:00Z',
    updatedAt: '2024-01-16T12:00:00Z',
    data: { type: 'research', status: 'completed' }
  },
  {
    id: '9',
    name: 'Content Management System',
    thumbnail: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=400&h=300&fit=crop',
    createdAt: '2024-01-11T10:00:00Z',
    updatedAt: '2024-01-24T09:00:00Z',
    data: { type: 'development', status: 'in-progress' }
  },
  {
    id: '10',
    name: 'Payment Integration',
    thumbnail: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop',
    createdAt: '2024-01-09T11:00:00Z',
    updatedAt: '2024-01-22T14:00:00Z',
    data: { type: 'development', status: 'active' }
  },
  {
    id: '11',
    name: 'Video Production',
    thumbnail: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&h=300&fit=crop',
    createdAt: '2024-01-07T12:00:00Z',
    updatedAt: '2024-01-20T16:00:00Z',
    data: { type: 'media', status: 'in-progress' }
  },
  {
    id: '12',
    name: 'Customer Portal',
    thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop',
    createdAt: '2024-01-13T13:00:00Z',
    updatedAt: '2024-01-23T15:00:00Z',
    data: { type: 'development', status: 'active' }
  },
  {
    id: '13',
    name: 'Email Templates',
    createdAt: '2024-01-04T14:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    data: { type: 'design', status: 'completed' }
  },
];

/**
 * Fetch all projects from the API
 * 
 * TODO: Replace with real API call when deployed
 * Real endpoint: http://www.nighutlabs.com/api/v1/projects
 */
export async function getProjects(): Promise<ProjectsResponse> {
  try {
    // TODO: Uncomment when real API is ready
    // const apiUrl = process.env.NIGHUTLABS_API_URL || 'http://www.nighutlabs.com/api/v1';
    // const response = await fetch(`${apiUrl}/projects`, {
    //   method: 'GET',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     // Add authentication headers when needed
    //     // 'Authorization': `Bearer ${process.env.API_TOKEN}`
    //   },
    //   cache: 'no-store', // or 'force-cache' depending on requirements
    // });
    // 
    // if (!response.ok) {
    //   throw new Error(`API request failed: ${response.statusText}`);
    // }
    // 
    // const data = await response.json();
    // return {
    //   success: true,
    //   data: data.projects,
    //   total: data.total
    // };

    // MOCK: Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // MOCK: Return mock data
    return {
      success: true,
      data: MOCK_PROJECTS,
      total: MOCK_PROJECTS.length
    };

  } catch (error) {
    console.error('Error fetching projects:', error);
    return {
      success: false,
      data: [],
      total: 0,
      error: error instanceof Error ? error.message : 'Failed to fetch projects'
    };
  }
}

/**
 * Delete a project by ID
 * 
 * TODO: Replace with real API call when deployed
 * Real endpoint: DELETE http://www.nighutlabs.com/api/v1/projects/{id}
 */
export async function deleteProject(projectId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // TODO: Uncomment when real API is ready
    // const apiUrl = process.env.NIGHUTLABS_API_URL || 'http://www.nighutlabs.com/api/v1';
    // const response = await fetch(`${apiUrl}/projects/${projectId}`, {
    //   method: 'DELETE',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    // });
    // 
    // if (!response.ok) {
    //   throw new Error(`Failed to delete project: ${response.statusText}`);
    // }
    // 
    // return { success: true };

    // MOCK: Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // MOCK: Simulate successful deletion
    return { success: true };

  } catch (error) {
    console.error('Error deleting project:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete project'
    };
  }
}
