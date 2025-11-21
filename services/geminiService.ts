import { GoogleGenAI, Type } from "@google/genai";
import { LearningAnalysis, FileData } from "../types";

// Robustly access env vars across different build environments (Vite, CRA, Next.js, Node)
const getApiKey = () => {
  // 1. Check standard process.env (Node/CRA/Next)
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.API_KEY) return process.env.API_KEY;
    if (process.env.REACT_APP_API_KEY) return process.env.REACT_APP_API_KEY;
    if (process.env.VITE_API_KEY) return process.env.VITE_API_KEY;
    if (process.env.NEXT_PUBLIC_API_KEY) return process.env.NEXT_PUBLIC_API_KEY;
  }
  
  // 2. Check Vite's import.meta.env
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore
    if (import.meta.env.VITE_API_KEY) return import.meta.env.VITE_API_KEY;
    // @ts-ignore
    if (import.meta.env.API_KEY) return import.meta.env.API_KEY;
  }

  return '';
};

const API_KEY = getApiKey();

export const analyzeContent = async (
  textInput: string, 
  fileData: FileData | null
): Promise<LearningAnalysis> => {
  if (!API_KEY) {
    console.error("API Key not found in environment variables.");
    throw new Error("MISSING_API_KEY");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  // Schema definition for structured output
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      topic: { type: Type.STRING, description: "Short title (max 5 words)" },
      estimatedMinutesTotal: { type: Type.NUMBER },
      recommendedRepetitions: { type: Type.NUMBER },
      difficultyRating: { type: Type.STRING, enum: ["Easy", "Moderate", "Complex", "Advanced"] },
      keyConcepts: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Top 3-5 key concepts"
      },
      studyPlan: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            sessionNumber: { type: Type.INTEGER },
            intervalLabel: { type: Type.STRING },
            method: { type: Type.STRING },
            focusDescription: { type: Type.STRING, description: "Very concise instruction (max 15 words)" },
            durationMinutes: { type: Type.NUMBER }
          }
        }
      },
      scientificRationale: { type: Type.STRING, description: "One concise sentence explaining the schedule." }
    },
    required: ["topic", "estimatedMinutesTotal", "recommendedRepetitions", "difficultyRating", "keyConcepts", "studyPlan", "scientificRationale"]
  };

  const parts: any[] = [];

  // Add file if present
  if (fileData) {
    const base64Data = fileData.base64.split(',')[1] || fileData.base64;
    parts.push({
      inlineData: {
        mimeType: fileData.mimeType,
        data: base64Data
      }
    });
  }

  const systemPrompt = `
    You are a Cognitive Science Expert. Create a Spaced Repetition study plan.
    
    STRICT RULES:
    1. Output MUST be valid JSON matching the schema.
    2. Keep all text fields extremely CONCISE to ensure JSON is not cut off.
    3. Plan Structure:
       - Session 1: Immediate (Day 0)
       - Session 2: +1 Day
       - Session 3: +3 Days
       - Session 4: +7 Days
  `;

  const userPrompt = textInput ? `Analyze text: ${textInput.substring(0, 20000)}` : `Analyze the file.`;
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
        temperature: 0.2,
        maxOutputTokens: 8192,
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");
    
    try {
        return JSON.parse(jsonText) as LearningAnalysis;
    } catch (parseError) {
        console.error("JSON Parse Error. Raw text:", jsonText);
        throw new Error("JSON_PARSE_ERROR");
    }

  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    
    if (error.message?.includes('403') || error.message?.includes('API key')) {
      throw new Error("INVALID_API_KEY");
    }
    if (error.message?.includes('400')) {
        throw new Error("BAD_REQUEST");
    }
    if (error.message === "JSON_PARSE_ERROR") {
        throw new Error("PARSING_ERROR");
    }
    if (error.message === "MISSING_API_KEY") {
        throw error;
    }
    
    throw new Error("GENERIC_ERROR");
  }
};