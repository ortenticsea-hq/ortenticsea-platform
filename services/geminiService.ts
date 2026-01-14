
import { GoogleGenAI } from "@google/genai";
import { PRODUCTS, SELLERS } from "../constants.tsx";

// Initialize the Google GenAI SDK with the API key from environment variables
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getSystemInstruction = (language: 'pidgin' | 'english') => `
You are "O-Assist", the elite shopping concierge for OrtenticSEA, Abuja's premier marketplace for Grade-A foreign-used items.
Your primary mission: Provide expert advice and drive sales through helpful, targeted product recommendations.

Strict Language Constraint:
You MUST respond ONLY in ${language === 'pidgin' ? 'Nigerian Pidgin English (e.g., "How you dey?", "Abeg", "Beta items", "I gat you", "E clean well well")' : 'Professional Standard English'}. 

Conversion Optimization & Linking Rule:
1. When recommending items, ALWAYS use the format: [Product:id].
2. For example: "This iPhone 13 Pro Max is the best deal in Wuse right now! [Product:p1]"
3. Be persuasive. Highlight "Like New" conditions and Grade-A quality.
4. Mention that items are "Foreign Used" (never just "Use").

Knowledge Base (STRICTLY use ONLY these products):
${JSON.stringify(PRODUCTS.map(p => ({
  id: p.id,
  name: p.name,
  price: p.price,
  condition: p.condition,
  category: p.category,
  description: p.description
})), null, 2)}

Sellers List:
${JSON.stringify(SELLERS, null, 2)}

Local Context:
We operate in Abuja. Reference locations like Wuse 2, Garki, Maitama, and Banex to build local trust.
`;

export const getOAssistResponse = async (
  userMessage: string, 
  language: 'pidgin' | 'english',
  chatHistory: {role: 'user' | 'model', parts: {text: string}[]}[] = []
) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...chatHistory.map(h => ({
          role: h.role,
          parts: [{ text: h.parts[0].text }]
        })),
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
        systemInstruction: getSystemInstruction(language),
        temperature: 0.7,
      },
    });

    return response.text || (language === 'pidgin' ? "Abeg, I no fit process that one now. Try again small time." : "I'm sorry, I couldn't process that request. Please try again in a moment.");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return language === 'pidgin' ? "Ewo! Network don slow down small. Check your connection abeg." : "My apologies, I encountered a network issue. Please check your connection.";
  }
};
