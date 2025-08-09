import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";
import { AspectRatioValue, ArtStyleValue, ArtStyleOption, AspectRatioOption, Character } from '../types'; // Added imports
import { ArtStyleOptions, AspectRatioOptions } from "../constants";


// The API key is set directly as per the user's request.
// WARNING: For security reasons, it is strongly recommended to use environment variables
// to manage API keys rather than hardcoding them in the source code.
const API_KEY = "AIzaSyDok0jWc7Twq920zR59_OKukzI3WK5wZTQ";


let ai: GoogleGenAI | null = null;

if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  // This block is unlikely to be reached with a hardcoded key, but maintained for structure.
  console.warn(
    "API_KEY is not set. Storyboard generation will not function."
  );
}

interface ImagePart {
  inlineData: {
    mimeType: string;
    data: string; // base64 encoded string (without prefix)
  };
}

interface TextPart {
  text: string;
}

export const generateEnhancedPromptWithReferences = async (
  sceneUserText: string,
  sceneCharacters: Character[], // Characters present in this specific scene
  allCharacters: Character[], // All defined characters, to fetch details if needed
  artStyle: ArtStyleValue,
  aspectRatio: AspectRatioValue
): Promise<string> => {
  if (!ai) {
    throw new Error("Gemini AI SDK not initialized. API_KEY might be missing.");
  }

  const parts: Part[] = [];

  let initialPromptText = `You are a master visual storyteller and prompt engineer for an advanced AI image generation model. Your task is to create a concise, highly detailed, and effective text prompt to generate a single storyboard panel.

Scene Description: ${sceneUserText}

`;

  const charactersInSceneWithDetails = sceneCharacters.map(sc => allCharacters.find(ac => ac.id === sc.id)).filter(Boolean) as Character[];

  if (charactersInSceneWithDetails.length > 0) {
    initialPromptText += "\nKey Characters in this scene (incorporate their visual descriptions and reference images if provided):\n";
    for (const char of charactersInSceneWithDetails) {
      initialPromptText += `- ${char.name}: ${char.description}\n`;
      if (char.referenceImageUrl && char.referenceImageMimeType) {
        // Add text part introducing the character image
        parts.push({ text: `Reference image for ${char.name} (${char.description}):` });
        // Add image part
        const base64Data = char.referenceImageUrl.split(',')[1]; // Remove data:mime/type;base64, prefix
        if (base64Data) {
            parts.push({
                inlineData: {
                    mimeType: char.referenceImageMimeType,
                    data: base64Data,
                },
            });
        }
      }
    }
  }
  
  const artStyleLabel = ArtStyleOptions.find(o => o.value === artStyle)?.label || "photorealistic";
  initialPromptText += `\nArt Style: ${artStyle}. Emphasize ${artStyleLabel.toLowerCase()} qualities. Create a visually rich image in this style.`;
  
  const aspectRatioLabel = AspectRatioOptions.find(o => o.value === aspectRatio)?.label || "16:9";
  initialPromptText += `\nImage Aspect Ratio: The final image should have a ${aspectRatioLabel.toLowerCase()} (${aspectRatio}) aspect ratio.`;
  
  initialPromptText += `\nConsider camera angles, composition, lighting, and mood implied by the scene description to create a compelling visual. Focus on a single, clear moment. Generate only the image description.`;

  // Add the main text part at the beginning
  parts.unshift({ text: initialPromptText });

  try {
    console.log("Generating enhanced prompt with parts:", parts);
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Use a model capable of multimodal input
      contents: { parts },
      // config: { thinkingConfig: { thinkingBudget: 0 } } // Optional: for lower latency if needed
    });

    const enhancedPrompt = response.text;
    if (!enhancedPrompt || enhancedPrompt.trim() === "") {
        console.error("Gemini Flash returned an empty enhanced prompt. Falling back to basic prompt construction.", response);
        // Fallback prompt (simplified, without image understanding)
        return `${sceneUserText}. Characters: ${charactersInSceneWithDetails.map(c => `${c.name}: ${c.description}`).join(', ')}. Art Style: ${artStyleLabel}. Aspect Ratio: ${aspectRatioLabel}.`;
    }
    console.log("Enhanced prompt from Gemini Flash:", enhancedPrompt);
    return enhancedPrompt;

  } catch (error) {
    console.error("Error generating enhanced prompt with Gemini API:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate enhanced prompt: ${error.message}`);
    }
    throw new Error("Failed to generate enhanced prompt due to an unknown error.");
  }
};


export const generateImage = async (enhancedPrompt: string, aspectRatio: AspectRatioValue): Promise<string> => {
  if (!ai) {
    throw new Error(
      "Gemini AI SDK not initialized. API_KEY might be missing or invalid."
    );
  }
  try {
    console.log("Generating image with ENHANCED prompt:", enhancedPrompt, "Aspect Ratio:", aspectRatio);
    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: enhancedPrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg', // Keep as JPEG for consistency
        aspectRatio: aspectRatio, 
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image?.imageBytes) {
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    } else {
      console.error("No image data in response from Imagen:", response);
      throw new Error("No image generated by Imagen or unexpected response structure.");
    }
  } catch (error) {
    console.error("Error generating image with Imagen API:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate image with Imagen: ${error.message}`);
    }
    throw new Error("Failed to generate image with Imagen due to an unknown error.");
  }
};

export const isApiKeySet = (): boolean => !!API_KEY && !!ai;