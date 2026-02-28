'use server'

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Streaming server action for Mistral LLM
export async function askMistral(prompt: string) {
  // Use an env var that changes based on where the app is running
  const LLM_SERVICE_URL = process.env.LLM_SERVICE_URL || 'http://localhost:3002';
  
  // 1. GET requests cannot have a body, so we encode the prompt as a query parameter
  const params = new URLSearchParams({ prompt });
  const urlWithParams = `${LLM_SERVICE_URL}/api/v1/llm/stream?${params.toString()}`;

  const res = await fetch(urlWithParams, {
    method: 'GET', // Changed from POST
    headers: { 
      // Changed 'Content-Type' (sent data) to 'Accept' (requested data format)
      'Accept': 'text/event-stream' 
    },
    // Body removed because GET requests ignore or block it
    cache: 'no-store',
  });

  if (!res.ok) {
    console.error(`LLM Service Error: ${res.status} ${res.statusText}`);
    throw new Error('Failed to reach LLM Service');
  }

  return res.body;
}

export async function sendChatMessage(messages: Message[]) {
  try {
    const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
    
    const response = await fetch(`${ollamaHost}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-nemo:latest',
        messages: messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      content: data.message?.content || 'Sorry, I could not generate a response.',
    };
  } catch (error) {
    console.error('Error calling Ollama API:', error);
    return {
      success: false,
      content: 'Sorry, I encountered an error while processing your request. Please make sure the Ollama service is running.',
    };
  }
}

// Generate design using LLM agent
export async function generateDesign(query: string, accessToken?: string) {
  try {
    if (!accessToken) {
      return {
        success: false,
        error: 'Unauthorized: No access token provided.',
      };
    }

    const LLM_SERVICE_URL = process.env.LLM_SERVICE_URL || 'http://localhost:3002';
    
    const response = await fetch(`${LLM_SERVICE_URL}/api/v1/agent/generate-design`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ query }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`LLM Agent Error: ${response.status} ${response.statusText}`, errorText);
      
      if (response.status === 401) {
        throw new Error('Unauthorized: Invalid or expired authentication token');
      }
      
      throw new Error(`Failed to generate design: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: {
        designId: data.designId,
        name: data.name,
        reasoning: data.reasoning || [],
        metadata: data.metadata || {},
      },
    };
  } catch (error) {
    console.error('Error generating design:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate design',
    };
  }
}

// RAG Chat using LLM service
export async function ragChat(prompt: string) {
  try {
    const LLM_SERVICE_URL = process.env.LLM_SERVICE_URL || 'http://localhost:3002';
    
    // Encode the prompt as a query parameter
    const params = new URLSearchParams({ prompt });
    const urlWithParams = `${LLM_SERVICE_URL}/api/v1/llm/v2/rag?${params.toString()}`;

    const response = await fetch(urlWithParams, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`RAG Chat Error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Failed to get RAG response: ${response.statusText}`);
    }

    // Check content type to handle both JSON and text responses
    const contentType = response.headers.get('content-type');
    let content = '';
    let metadata = {};

    if (contentType?.includes('application/json')) {
      // Response is JSON
      const data = await response.json();
      content = data.response || data.content || data.answer || 'No response received';
      metadata = data.metadata || {};
    } else {
      // Response is plain text
      content = await response.text();
    }

    return {
      success: true,
      data: {
        content,
        metadata,
      },
    };
  } catch (error) {
    console.error('Error calling RAG Chat:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get RAG response',
    };
  }
}
