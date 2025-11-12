import { GoogleGenAI, Type, Modality } from "@google/genai";
import { GeneratedTextContent } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const textModel = 'gemini-2.5-pro';
const imageModel = 'gemini-2.5-flash-image';

const schema = {
  type: Type.OBJECT,
  properties: {
    planningIntention: {
      type: Type.STRING,
      description: "기획 의도 (Korean)",
    },
    englishPrompt: {
      type: Type.STRING,
      description: "Image generation prompt (English)",
    },
    keywords: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description: "Recommended keywords (English)",
    },
  },
  required: ["planningIntention", "englishPrompt", "keywords"],
};

export const generateTextContent = async (subject: string, style: string, hasBackground: boolean): Promise<GeneratedTextContent> => {
  const backgroundInstruction = hasBackground 
    ? "The image should have a suitable and detailed background." 
    : "The image MUST have a transparent background. The prompt should explicitly ask for a PNG with a transparent background or an object isolated on white to be removed later.";

  const prompt = `
    You are a creative assistant for a stock image generation service.
    Based on the user's request, provide a JSON object with three keys: "planningIntention", "englishPrompt", and "keywords".

    User Request:
    - Subject: ${subject}
    - Style: ${style}
    - Background: ${hasBackground ? 'Yes' : 'No'}

    Instructions:
    1.  **planningIntention**: Write a brief (1-2 sentences) creative concept or plan for the image in Korean.
    2.  **englishPrompt**: Create a detailed, descriptive, and effective image generation prompt in English. It should be optimized for a generative AI model. It must incorporate the subject and the style. ${backgroundInstruction}
    3.  **keywords**: Provide an array of 10-15 relevant keywords in English, suitable for a stock image website.

    Return ONLY the JSON object.
  `;

  const response = await ai.models.generateContent({
    model: textModel,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  const jsonText = response.text.trim();
  try {
    const parsedJson = JSON.parse(jsonText);
    // Ensure keywords is always an array
    if (!Array.isArray(parsedJson.keywords)) {
      parsedJson.keywords = [];
    }
    return parsedJson as GeneratedTextContent;
  } catch (e) {
    console.error("Failed to parse JSON from Gemini:", jsonText);
    throw new Error("Received invalid JSON response from the AI.");
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: imageModel,
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      const base64ImageBytes: string = part.inlineData.data;
      const mimeType = part.inlineData.mimeType;
      return `data:${mimeType};base64,${base64ImageBytes}`;
    }
  }

  throw new Error("No image was generated.");
};
