'use server'

interface Message {
  role: 'user' | 'assistant';
  content: string;
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
