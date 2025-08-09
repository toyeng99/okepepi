export interface Character {
  id: string;
  name: string;
  description: string; // Detailed visual description for consistency
  referenceImageUrl?: string | null; // Base64 data URL of the reference image
  referenceImageMimeType?: string | null; // Mime type of the reference image
}

export interface Scene {
  id: string;
  panelNumber: number;
  userText: string; // Text input by the user for this scene/shot
  characterIds: string[]; // IDs of characters in this scene
  finalPrompt?: string; // The actual prompt sent to Gemini (potentially enhanced)
  imageUrl?: string; // Base64 image data URL
  generating: boolean;
  error?: string;
}

// Enum values are partial prompts for art styles
export enum ArtStyleValue {
  CARTOON = "charming cartoon style, animated movie screenshot, vibrant colors",
  PHOTOREALISTIC = "photorealistic, cinematic lighting, high detail, film still",
  WATERCOLOR = "watercolor painting, soft edges, artistic effect, flowing colors",
  SKETCH = "pencil sketch, monochrome, hand-drawn aesthetic, detailed shading",
  CYBERPUNK = "cyberpunk art style, neon lights, futuristic city, gritty atmosphere, Blade Runner aesthetic",
  FANTASY = "high fantasy art, epic scenery, magical elements, detailed illustration",
  NOIR = "film noir style, black and white, dramatic shadows, 1940s detective movie",
  PIXELART = "pixel art, retro 16-bit video game style, limited color palette",
  MINIMALIST = "minimalist vector art, clean lines, flat colors, simple shapes",
  VINTAGE_COMIC = "vintage comic book art, halftone dots, bold outlines, retro colors",
  PIXAR = "3D Pixar animation style, highly detailed characters, vibrant and warm lighting, cinematic composition, reminiscent of modern animated feature films"
}

export interface ArtStyleOption {
  value: ArtStyleValue;
  label: string;
}

export enum AspectRatioValue {
  SIXTEEN_NINE = "16:9", // Landscape
  NINE_SIXTEEN = "9:16", // Portrait
  ONE_ONE = "1:1",     // Square
  FOUR_THREE = "4:3",   // Classic TV / Monitor
  THREE_TWO = "3:2",    // Photography
}

export interface AspectRatioOption {
  value: AspectRatioValue;
  label: string;
}