/**
 * AI Skin Generator using OpenAI DALL-E 3
 * 
 * This module provides real AI image generation for Minecraft skins.
 * Requires NEXT_PUBLIC_OPENAI_API_KEY environment variable.
 * 
 * The generated image is then processed to fit the 64x64 Minecraft skin format.
 */

const OPENAI_API_URL = 'https://api.openai.com/v1/images/generations';

export interface AIGenerationOptions {
  prompt: string;
  style?: 'cartoon' | 'realistic' | 'pixel-art' | 'anime' | 'blocky';
  quality?: 'standard' | 'hd';
}

export interface AIGenerationResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

/**
 * Check if AI generation is available (API key configured)
 */
export function isAIAvailable(): boolean {
  return typeof window !== 'undefined' && 
    !!process.env.NEXT_PUBLIC_OPENAI_API_KEY;
}

/**
 * Get the style prompt suffix for different art styles
 */
function getStylePrompt(style: string): string {
  switch (style) {
    case 'cartoon':
      return 'cartoon style, vibrant colors, bold outlines, playful';
    case 'realistic':
      return 'semi-realistic, detailed textures, natural shading';
    case 'pixel-art':
      return 'pixel art style, 8-bit, retro gaming aesthetic';
    case 'anime':
      return 'anime style, cel-shaded, Japanese animation aesthetic';
    case 'blocky':
      return 'Minecraft blocky style, voxel-like, cubic proportions';
    default:
      return 'Minecraft style, blocky, pixel-art';
  }
}

/**
 * Generate a Minecraft skin using AI
 * 
 * @param options - Generation options including prompt and style
 * @returns Promise with the generation result
 */
export async function generateAISkin(options: AIGenerationOptions): Promise<AIGenerationResult> {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  
  if (!apiKey) {
    return {
      success: false,
      error: 'OpenAI API key not configured. Set NEXT_PUBLIC_OPENAI_API_KEY environment variable.',
    };
  }

  const stylePrompt = getStylePrompt(options.style || 'blocky');
  
  // Craft a prompt optimized for Minecraft skin generation
  const fullPrompt = `Create a Minecraft character skin texture sheet. The character is: ${options.prompt}. 
Style: ${stylePrompt}. 
Important: Generate a flat texture layout showing front view of head, body, arms, and legs suitable for a Minecraft skin.
The image should be clean, simple, with clear distinct regions for each body part.
No background, just the character texture on a transparent or white background.`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: fullPrompt,
        n: 1,
        size: '1024x1024',
        quality: options.quality || 'standard',
        response_format: 'url',
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      return {
        success: false,
        error: error.error?.message || `API error: ${response.status}`,
      };
    }

    const data = await response.json();
    const imageUrl = data.data?.[0]?.url;

    if (!imageUrl) {
      return {
        success: false,
        error: 'No image URL in response',
      };
    }

    return {
      success: true,
      imageUrl,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Convert an AI-generated image to Minecraft skin format (64x64)
 * This takes the generated image and maps it to the skin texture layout.
 * 
 * @param imageUrl - URL of the AI-generated image
 * @returns Promise with base64 data URL of the processed skin
 */
export async function convertToSkinFormat(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      // Create a 64x64 canvas for the skin
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not create canvas context'));
        return;
      }

      // Clear canvas with transparency
      ctx.clearRect(0, 0, 64, 64);
      
      // The AI image is 1024x1024, we need to map regions to skin format
      // Minecraft skin layout (64x64 or 64x32):
      // Head: 8x8 at various positions
      // Body: 8x12
      // Arms: 4x12
      // Legs: 4x12
      
      // For simplicity, we'll extract the central character and map to skin regions
      // This is a basic mapping - advanced version could use ML for better extraction
      
      const srcSize = img.width;
      
      // Head (front) - typically center-top of generated image
      // Source: top-center 25% of image
      // Dest: 8x8 at (8, 8)
      ctx.drawImage(
        img,
        srcSize * 0.375, srcSize * 0.05, srcSize * 0.25, srcSize * 0.25, // src
        8, 8, 8, 8 // dest (head front)
      );
      
      // Head (back) - dest: 8x8 at (24, 8)
      ctx.drawImage(
        img,
        srcSize * 0.375, srcSize * 0.05, srcSize * 0.25, srcSize * 0.25,
        24, 8, 8, 8
      );
      
      // Head (top) - dest: 8x8 at (8, 0)
      ctx.drawImage(
        img,
        srcSize * 0.375, srcSize * 0.02, srcSize * 0.25, srcSize * 0.15,
        8, 0, 8, 8
      );
      
      // Head (bottom) - dest: 8x8 at (16, 0)
      ctx.drawImage(
        img,
        srcSize * 0.375, srcSize * 0.28, srcSize * 0.25, srcSize * 0.15,
        16, 0, 8, 8
      );
      
      // Head (right) - dest: 8x8 at (0, 8)
      ctx.drawImage(
        img,
        srcSize * 0.30, srcSize * 0.05, srcSize * 0.15, srcSize * 0.25,
        0, 8, 8, 8
      );
      
      // Head (left) - dest: 8x8 at (16, 8)
      ctx.drawImage(
        img,
        srcSize * 0.55, srcSize * 0.05, srcSize * 0.15, srcSize * 0.25,
        16, 8, 8, 8
      );
      
      // Body (front) - center of image, below head
      // Source: center 20% horizontally, 30% vertically from 30% down
      // Dest: 8x12 at (20, 20)
      ctx.drawImage(
        img,
        srcSize * 0.40, srcSize * 0.32, srcSize * 0.20, srcSize * 0.35,
        20, 20, 8, 12
      );
      
      // Body (back) - dest: 8x12 at (32, 20)
      ctx.drawImage(
        img,
        srcSize * 0.40, srcSize * 0.32, srcSize * 0.20, srcSize * 0.35,
        32, 20, 8, 12
      );
      
      // Right Arm (front) - dest: 4x12 at (44, 20)
      ctx.drawImage(
        img,
        srcSize * 0.25, srcSize * 0.32, srcSize * 0.10, srcSize * 0.35,
        44, 20, 4, 12
      );
      
      // Left Arm (front) - dest: 4x12 at (36, 52) (second layer for 64x64 skins)
      ctx.drawImage(
        img,
        srcSize * 0.65, srcSize * 0.32, srcSize * 0.10, srcSize * 0.35,
        36, 52, 4, 12
      );
      
      // Right Leg (front) - dest: 4x12 at (4, 20)
      ctx.drawImage(
        img,
        srcSize * 0.35, srcSize * 0.68, srcSize * 0.10, srcSize * 0.30,
        4, 20, 4, 12
      );
      
      // Left Leg (front) - dest: 4x12 at (20, 52) (second layer)
      ctx.drawImage(
        img,
        srcSize * 0.55, srcSize * 0.68, srcSize * 0.10, srcSize * 0.30,
        20, 52, 4, 12
      );

      // Export as PNG data URL
      resolve(canvas.toDataURL('image/png'));
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load AI-generated image'));
    };
    
    img.src = imageUrl;
  });
}

/**
 * Full pipeline: generate AI skin and convert to Minecraft format
 */
export async function generateAndConvertSkin(options: AIGenerationOptions): Promise<{
  success: boolean;
  skinDataUrl?: string;
  originalImageUrl?: string;
  error?: string;
}> {
  // Step 1: Generate AI image
  const result = await generateAISkin(options);
  
  if (!result.success || !result.imageUrl) {
    return {
      success: false,
      error: result.error || 'Failed to generate image',
    };
  }

  try {
    // Step 2: Convert to Minecraft skin format
    const skinDataUrl = await convertToSkinFormat(result.imageUrl);
    
    return {
      success: true,
      skinDataUrl,
      originalImageUrl: result.imageUrl,
    };
  } catch (error) {
    return {
      success: false,
      originalImageUrl: result.imageUrl,
      error: error instanceof Error ? error.message : 'Failed to convert to skin format',
    };
  }
}
