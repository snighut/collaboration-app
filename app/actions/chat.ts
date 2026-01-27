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
