import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileName: string }> },
) {
  const { fileName } = await params;
  if (!/^[a-zA-Z0-9-]+\.jpg$/.test(fileName)) {
    return new Response('Not found', { status: 404 });
  }
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return new Response('Unauthorized', { status: 401 });
  }
  const baseUrl = process.env.DESIGN_SERVICE_URL || 'http://design-service:3000';
  const response = await fetch(`${baseUrl}/api/v1/thumbnails/${fileName}`, {
    headers: { authorization },
    cache: 'no-store',
  });
  if (!response.ok) {
    return new Response('Thumbnail unavailable', { status: response.status });
  }
  return new Response(response.body, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
