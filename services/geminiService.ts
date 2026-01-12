import { GoogleGenAI, Type } from "@google/genai";

// Ensure API key is available
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateGameLore = async (prompt: string): Promise<string> => {
  if (!apiKey) return "AI services unavailable (Missing API Key).";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Create a short, thrilling backstory (max 50 words) for a high-speed racing game mode based on this idea: ${prompt}. Make it sound intense like a movie trailer.`,
    });
    return response.text || "Failed to generate lore.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating game lore.";
  }
};

export const generateAICommentary = async (gameState: string): Promise<string> => {
    if (!apiKey) return "";
  
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are an energetic esports announcer for a racing game. The current event is: ${gameState}. Give a one-sentence hype comment.`,
      });
      return response.text || "";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "";
    }
  };

export interface GameMasterDecision {
  event: string;
  speedMod: number;
  obstacleMod: number;
}

export const consultGameMaster = async (score: number, speed: number): Promise<GameMasterDecision> => {
  if (!apiKey) return { event: "NORMAL TRAFFIC", speedMod: 0, obstacleMod: 1 };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Act as a Game Master for a racing game.
        Current State: Score ${score}, Speed ${speed}.
        Decide on a random game event to challenge the player or help them.
        Examples: "Meteor Shower" (high obstacles), "Empty Highway" (low obstacles, high speed), "Police Chase" (fast speed), "Engine Failure" (slow speed).
        
        Return JSON.
      `,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            event: { type: Type.STRING, description: "Name of the event" },
            speedMod: { type: Type.NUMBER, description: "Speed modifier (e.g., -5 to +10)" },
            obstacleMod: { type: Type.NUMBER, description: "Spawn rate multiplier (e.g. 0.5 for less, 2.0 for double)" },
          }
        }
      }
    });
    
    if (response.text) {
        return JSON.parse(response.text);
    }
    return { event: "NORMAL TRAFFIC", speedMod: 0, obstacleMod: 1 };
  } catch (error) {
    console.error("Game Master Error:", error);
    return { event: "NORMAL TRAFFIC", speedMod: 0, obstacleMod: 1 };
  }
};
