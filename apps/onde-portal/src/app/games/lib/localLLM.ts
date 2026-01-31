/**
 * Local LLM Integration for Skin Studio
 * 
 * Connects to local LLM server (llama-3.1-8b on M1+Radeon)
 * Falls back gracefully if not available
 */

const LOCAL_LLM_URL = process.env.NEXT_PUBLIC_LOCAL_LLM_URL || 'http://192.168.1.111:8080';

export interface LLMResponse {
  success: boolean;
  content?: string;
  error?: string;
}

/**
 * Check if local LLM is available
 */
export async function checkLocalLLM(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(`${LOCAL_LLM_URL}/health`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    
    if (response.ok) {
      const data = await response.json();
      return data.status === 'ok';
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Get available model from local LLM
 */
export async function getLocalModel(): Promise<string | null> {
  try {
    const response = await fetch(`${LOCAL_LLM_URL}/v1/models`);
    if (response.ok) {
      const data = await response.json();
      return data.data?.[0]?.id || null;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Chat with local LLM
 */
export async function chatWithLocalLLM(
  prompt: string,
  options: {
    maxTokens?: number;
    temperature?: number;
    systemPrompt?: string;
    timeoutMs?: number;
  } = {}
): Promise<LLMResponse> {
  const { maxTokens = 256, temperature = 0.7, systemPrompt, timeoutMs = 60000 } = options;
  
  try {
    const isAvailable = await checkLocalLLM();
    if (!isAvailable) {
      return { success: false, error: 'Local LLM not available' };
    }
    
    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    
    const response = await fetch(`${LOCAL_LLM_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instruct',
        messages,
        max_tokens: maxTokens,
        temperature,
      }),
      signal: controller.signal,
    });
    
    clearTimeout(timeout);
    
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (content) {
      return { success: true, content };
    }
    return { success: false, error: 'No content in response' };
    
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Generate enhanced prompt for skin generation using local LLM
 */
export async function enhancePromptWithLLM(userPrompt: string): Promise<string> {
  const systemPrompt = `You are a Minecraft skin design assistant. 
Given a user's description, enhance it into a detailed prompt for generating a Minecraft character skin.
Keep it concise (1-2 sentences) but add specific details about colors, style, and features.
Output ONLY the enhanced prompt, nothing else.`;

  const result = await chatWithLocalLLM(userPrompt, {
    maxTokens: 100,
    temperature: 0.8,
    systemPrompt,
  });
  
  if (result.success && result.content) {
    return result.content.trim();
  }
  
  // Fallback: return original prompt
  return userPrompt;
}

/**
 * Generate color palette suggestions using local LLM
 */
export async function suggestColorPalette(theme: string): Promise<string[]> {
  const systemPrompt = `You are a color palette expert for Minecraft skins.
Given a theme, suggest exactly 5 hex color codes that would work well together.
Output ONLY the hex codes separated by commas, nothing else.
Example: #FF6B6B,#4ECDC4,#45B7D1,#96CEB4,#FFEAA7`;

  const result = await chatWithLocalLLM(`Theme: ${theme}`, {
    maxTokens: 50,
    temperature: 0.5,
    systemPrompt,
  });
  
  if (result.success && result.content) {
    const colors = result.content
      .split(',')
      .map(c => c.trim())
      .filter(c => /^#[0-9A-Fa-f]{6}$/.test(c));
    
    if (colors.length >= 3) {
      return colors.slice(0, 5);
    }
  }
  
  // Fallback: default palette
  return ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
}
