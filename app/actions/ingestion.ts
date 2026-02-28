'use server';

const LLM_SERVICE_URL = process.env.LLM_SERVICE_URL || 'http://localhost:3002';

export async function getUploadUrl(
  fileName: string,
  fileHash: string,
  userId?: string,
  accessToken?: string,
) {
  if (!accessToken) {
    throw new Error('Unauthorized: No access token provided.');
  }

  const response = await fetch(`${LLM_SERVICE_URL}/api/v1/ingestion/upload-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ fileName, fileHash, userId }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized: Invalid or expired authentication token');
    }
    throw new Error('Failed to get upload URL');
  }

  return response.json();
}

export async function triggerProcessing(
  objectKey: string,
  fileName: string,
  fileHash: string,
  userId?: string,
  accessToken?: string,
) {
  if (!accessToken) {
    throw new Error('Unauthorized: No access token provided.');
  }

  const response = await fetch(`${LLM_SERVICE_URL}/api/v1/ingestion/process`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ objectKey, fileName, fileHash, userId }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized: Invalid or expired authentication token');
    }
    throw new Error('Failed to trigger processing');
  }

  return response.json();
}

export async function getJobStatus(jobId: string) {
  const response = await fetch(
    `${LLM_SERVICE_URL}/api/v1/ingestion/status/${jobId}`,
  );

  if (!response.ok) {
    throw new Error('Failed to get job status');
  }

  return response.json();
}
