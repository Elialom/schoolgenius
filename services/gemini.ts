import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

// Initialize Gemini
// Note: In a real production app, you might proxy this through a backend.
// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateQuestions = async (
  subject: string, 
  grade: string, 
  count: number = 20,
  onProgress?: (count: number) => void
): Promise<Question[]> => {
  const model = "gemini-3-flash-preview";
  // We'll generate in batches of 5 to provide progress updates
  const BATCH_SIZE = 5;
  const batches = Math.ceil(count / BATCH_SIZE);
  let allQuestions: Question[] = [];

  for (let i = 0; i < batches; i++) {
    // Calculate how many to generate in this batch
    const currentBatchSize = Math.min(BATCH_SIZE, count - allQuestions.length);
    
    const prompt = `Generate ${currentBatchSize} unique ${subject} multiple-choice questions for a student in Grade ${grade}. 
    The questions should range in difficulty suitable for that grade level. 
    Ensure the questions cover various topics within ${subject} appropriate for the grade.
    Provide 4 options for each question.`;

    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING, description: "The question text" },
                options: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "An array of 4 possible answers"
                },
                correctAnswer: { 
                  type: Type.INTEGER, 
                  description: "The index (0-3) of the correct answer in the options array" 
                }
              },
              required: ["text", "options", "correctAnswer"]
            }
          }
        }
      });

      const rawData = response.text;
      if (rawData) {
        const parsedData = JSON.parse(rawData);
        
        // Map to our internal Question type with unique IDs
        // We add the batch index 'i' to the ID to ensure uniqueness
        const mappedQuestions = parsedData.map((q: any, index: number) => ({
          id: `q-${Date.now()}-${i}-${index}`,
          text: q.text,
          options: q.options,
          correctAnswer: q.correctAnswer
        }));

        allQuestions = [...allQuestions, ...mappedQuestions];
      }
      
      // Update progress
      if (onProgress) {
        onProgress(allQuestions.length);
      }

    } catch (error) {
      console.error(`Failed to generate batch ${i + 1}:`, error);
      throw error;
    }
  }
  
  return allQuestions;
};