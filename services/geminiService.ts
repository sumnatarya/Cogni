import { GoogleGenAI, Type } from "@google/genai";
import { LearningAnalysis, FileData } from "../types";

const API_KEY = process.env.API_KEY || '';

export const analyzeContent = async (
  textInput: string, 
  fileData: FileData | null
): Promise<LearningAnalysis> => {
  if (!API_KEY) {
    throw new Error("MISSING_API_KEY");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  // Schema definition for structured output
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      topic: { type: Type.STRING, description: "A concise title for the learning material" },
      estimatedMinutesTotal: { type: Type.NUMBER, description: "Total active study time required in minutes to master this specific content" },
      recommendedRepetitions: { type: Type.NUMBER, description: "Number of spaced repetition sessions recommended" },
      difficultyRating: { type: Type.STRING, enum: ["Easy", "Moderate", "Complex", "Advanced"] },
      keyConcepts: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Top 3-5 key concepts extracted from the material"
      },
      studyPlan: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            sessionNumber: { type: Type.INTEGER },
            intervalLabel: { type: Type.STRING, description: "When to study relative to start (e.g., 'Day 1', 'Day 3')" },
            method: { type: Type.STRING, description: "Specific active learning technique (e.g., Active Recall, Mind Mapping)" },
            focusDescription: { type: Type.STRING, description: "What specific part to focus on or how to apply the method" },
            durationMinutes: { type: Type.NUMBER, description: "Length of this specific session" }
          }
        }
      },
      scientificRationale: { type: Type.STRING, description: "A brief explanation citing learning science principles (e.g., Ebbinghaus curve, interleaving) justifying this specific plan." }
    },
    required: ["topic", "estimatedMinutesTotal", "recommendedRepetitions", "difficultyRating", "keyConcepts", "studyPlan", "scientificRationale"]
  };

  const parts: any[] = [];

  // Add file if present
  if (fileData) {
    // Remove header from base64 string if present (e.g., "data:image/png;base64,")
    const base64Data = fileData.base64.split(',')[1] || fileData.base64;
    parts.push({
      inlineData: {
        mimeType: fileData.mimeType,
        data: base64Data
      }
    });
  }

  // Add text prompt
  const systemPrompt = `
    You are a world-class Cognitive Science and Learning Expert. 
    Analyze the provided content.
    
    Goal: Create the most efficient study plan based on Information Density, Complexity, and the Forgetting Curve.
    
    STRICTLY FOLLOW SPACED REPETITION:
    - Session 1: Immediate (Day 0) - Encoding/Understanding.
    - Session 2: +1 Day (Day 1) - Active Recall.
    - Session 3: +2 Days (Day 3) - Interleaving/Application.
    - Session 4: +4 Days (Day 7) - Final Review.
    
    Output a structured JSON plan. Be concise.
  `;

  const userPrompt = textInput ? `Analyze this text: ${textInput}` : `Analyze the attached file content.`;

  parts.push({ text: userPrompt });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: parts
      },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.3,
        maxOutputTokens: 2000, // Limit tokens for faster response
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");
    
    return JSON.parse(jsonText) as LearningAnalysis;

  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    
    // Handle common API errors
    if (error.message?.includes('403') || error.message?.includes('API key')) {
      throw new Error("INVALID_API_KEY");
    }
    if (error.message?.includes('400')) {
        throw new Error("BAD_REQUEST");
    }
    
    throw new Error("GENERIC_ERROR");
  }
};