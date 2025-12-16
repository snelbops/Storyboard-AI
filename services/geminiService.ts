import { GoogleGenAI, Type } from "@google/genai";
import { ScriptAnalysisResponse, VisualStyle, VisualSubStyle } from "../types";

// Initialize Gemini Client
// IMPORTANT: API key is assumed to be in process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SCRIPT_MODEL = 'gemini-2.5-flash';
const IMAGE_MODEL = 'gemini-2.5-flash-image';

/**
 * Breaks down a raw script text into structured scenes using Gemini 2.5 Flash.
 */
export const breakScriptIntoScenes = async (scriptText: string): Promise<ScriptAnalysisResponse> => {
  const prompt = `
    Analyze the following screenplay/script text. 
    Break it down into individual scenes. 
    For each scene, extract the Scene Header (Slugline), a concise visual description of the action suitable for a storyboard artist, and a list of characters present.
    Return the result as a JSON object.
  `;

  const response = await ai.models.generateContent({
    model: SCRIPT_MODEL,
    contents: [
      { text: prompt },
      { text: scriptText }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          scenes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                sceneNumber: { type: Type.INTEGER },
                header: { type: Type.STRING },
                description: { type: Type.STRING },
                characters: { 
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["sceneNumber", "header", "description", "characters"]
            }
          }
        }
      }
    }
  });

  if (!response.text) {
    throw new Error("No response from Gemini.");
  }

  return JSON.parse(response.text) as ScriptAnalysisResponse;
};

const getStylePrompt = (style: VisualStyle, subStyle: VisualSubStyle): string => {
  // Explainer Styles
  if (style === 'EXPLAINER') {
    switch (subStyle) {
      case 'WHITEBOARD':
        return "Hand-drawn whiteboard animation style. Simple black marker lines on white background, minimal stick-figure-like characters, educational, clear diagrammatic feel.";
      case 'ISOMETRIC':
        return "Isometric 3D vector illustration. Clean geometry, technical, soft gradient lighting, pastel colors, business technology aesthetic, floating elements.";
      case 'LINE_ART':
        return "Minimalist technical line art. Blueprint aesthetic, thin precise lines, monochrome or dual-tone (blue/white), schematic, clean, no shading.";
      case 'MEMPHIS':
      default:
        return "Flat vector art illustration. Corporate memphis style, exaggerated proportions, bright solid colors (purple, yellow, teal), clean shapes, white background, instructional.";
    }
  }

  // Cinematic Styles (Default)
  switch (subStyle) {
    case 'NOIR':
      return "Film noir storyboard sketch. High contrast black and white, dramatic chiaroscuro lighting, deep shadows, silhouettes, moody, vintage crime aesthetic.";
    case 'DIGITAL':
      return "Concept art style digital painting. Detailed, atmospheric lighting, cinematic color grading, realistic proportions, smooth brushwork, 4k movie frame concept.";
    case 'WATERCOLOR':
      return "Watercolor storyboard sketch. Expressive loose brush strokes, artistic, slight bleeding edges, desaturated cinematic colors, dreamy atmosphere.";
    case 'PENCIL':
    default:
      return "Rough pencil sketch storyboard. Hand-drawn graphite on paper aesthetic, loose energetic lines, hatching for shading, monochrome, traditional pre-production art.";
  }
};

/**
 * Generates a storyboard image for a scene using Gemini 2.5 Flash Image.
 */
export const generateSceneImage = async (sceneDescription: string, header: string, style: VisualStyle, subStyle: VisualSubStyle): Promise<string> => {
  const stylePrompt = getStylePrompt(style, subStyle);
  const prompt = `${stylePrompt} Scene Header: ${header}. Action: ${sceneDescription}`;

  const response = await ai.models.generateContent({
    model: IMAGE_MODEL,
    contents: {
      parts: [
        { text: prompt }
      ]
    },
    config: {
      // imageConfig parameters could be added here if supported by the specific model version's strict types,
      // but for nano banana (2.5 flash image), defaults are usually sufficient for this use case.
    }
  });

  // Extract image from response
  // We need to iterate parts to find the image
  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) throw new Error("No content generated");

  for (const part of parts) {
    if (part.inlineData && part.inlineData.data) {
      // Assuming PNG or JPEG returned, usually JPEG for generated images unless specified
      const mimeType = part.inlineData.mimeType || 'image/jpeg';
      return `data:${mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image data found in response");
};

/**
 * Edits an existing image based on a user prompt using Gemini 2.5 Flash Image.
 */
export const editSceneImage = async (base64Image: string, instruction: string, style: VisualStyle, subStyle: VisualSubStyle): Promise<string> => {
  // Remove data URL prefix if present for the API call payload
  const matches = base64Image.match(/^data:(.+);base64,(.+)$/);
  if (!matches) {
    throw new Error("Invalid base64 image format");
  }
  const mimeType = matches[1];
  const data = matches[2];

  const styleContext = `Keep the ${subStyle.toLowerCase().replace('_', ' ')} ${style.toLowerCase()} style consistency.`;

  const fullPrompt = `${instruction}. ${styleContext}`;

  const response = await ai.models.generateContent({
    model: IMAGE_MODEL,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: mimeType,
            data: data
          }
        },
        { text: fullPrompt }
      ]
    }
  });

   const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) throw new Error("No content generated");

  for (const part of parts) {
    if (part.inlineData && part.inlineData.data) {
      const mimeType = part.inlineData.mimeType || 'image/jpeg';
      return `data:${mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No edited image returned");
};
