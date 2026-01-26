/**
 * Create a new design via the Node.js API
 * Calls the real API endpoint in the Kubernetes cluster
 */
export async function createDesign(formData: FormData): Promise<any> {
  // Use the internal Kubernetes service DNS name for the Node.js API
  const apiUrl = process.env.DESIGN_SERVICE_URL || 'http://design-service:3000';

  // Convert FormData to JSON object
  const data: Record<string, any> = {};
  formData.forEach((value, key) => {
    data[key] = value;
  });

  const response = await fetch(`${apiUrl}/api/v1/designs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}
