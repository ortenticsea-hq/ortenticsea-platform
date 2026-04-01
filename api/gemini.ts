import { PRODUCTS, SELLERS } from '../constants.tsx';

type ChatHistoryEntry = {
  role: 'user' | 'model';
  parts: { text: string }[];
};

type GeminiRequestBody = {
  userMessage?: string;
  language?: 'pidgin' | 'english';
  chatHistory?: ChatHistoryEntry[];
};

type VercelRequestLike = {
  method?: string;
  body?: GeminiRequestBody | string;
};

type VercelResponseLike = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => VercelResponseLike;
  json: (body: unknown) => void;
  end: (body?: string) => void;
};

const MODEL = 'gemini-2.0-flash';

const getApiKey = () => {
  const candidates = [
    process.env.GEMINI_API_KEY,
    process.env.GOOGLE_API_KEY,
    process.env.VITE_GEMINI_API_KEY,
  ];

  for (const rawValue of candidates) {
    const value = rawValue?.trim();
    if (value && value !== 'undefined' && value !== 'null') {
      return value;
    }
  }

  return null;
};

const getFallbackMessage = (language: 'pidgin' | 'english') =>
  language === 'pidgin'
    ? 'Abeg, assistant never ready right now. Try again shortly.'
    : 'The assistant is not configured right now. Please try again shortly.';

const getSystemInstruction = (language: 'pidgin' | 'english') => `
You are "O-Assist", the elite shopping concierge for OrtenticSEA, Abuja's premier marketplace for Grade-A foreign-used items.
Your primary mission: Provide expert advice and drive sales through helpful, targeted product recommendations.

Strict Language Constraint:
You MUST respond ONLY in ${language === 'pidgin' ? 'Nigerian Pidgin English' : 'Professional Standard English'}.

Conversion Optimization & Linking Rule:
1. When recommending items, ALWAYS use the format: [Product:id].
2. Highlight Grade-A quality, trusted sellers, and practical buyer benefits.
3. Mention items are Foreign Used when relevant.
4. Keep replies concise, helpful, and sales-oriented.

Knowledge Base (STRICTLY use ONLY these products):
${JSON.stringify(PRODUCTS.map((product) => ({
  id: product.id,
  name: product.name,
  price: product.price,
  condition: product.condition,
  category: product.category,
  description: product.description,
})), null, 2)}

Sellers List:
${JSON.stringify(SELLERS, null, 2)}

Local Context:
We operate in Abuja. Reference places like Wuse 2, Garki, Maitama, and Banex naturally when useful.
`;

const normalizeBody = (body: VercelRequestLike['body']): GeminiRequestBody => {
  if (!body) {
    return {};
  }

  if (typeof body === 'string') {
    try {
      return JSON.parse(body) as GeminiRequestBody;
    } catch {
      return {};
    }
  }

  return body;
};

export default async function handler(req: VercelRequestLike, res: VercelResponseLike) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = normalizeBody(req.body);
  const language = body.language === 'pidgin' ? 'pidgin' : 'english';
  const userMessage = body.userMessage?.trim();
  const chatHistory = Array.isArray(body.chatHistory) ? body.chatHistory : [];

  if (!userMessage) {
    res.status(400).json({ error: 'Missing userMessage', text: getFallbackMessage(language) });
    return;
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    res.status(200).json({ text: getFallbackMessage(language), configured: false });
    return;
  }

  try {
    const contents = [
      ...chatHistory
        .filter((entry) => entry && (entry.role === 'user' || entry.role === 'model'))
        .map((entry) => ({
          role: entry.role,
          parts: entry.parts
            .filter((part) => typeof part?.text === 'string' && part.text.trim().length > 0)
            .map((part) => ({ text: part.text })),
        }))
        .filter((entry) => entry.parts.length > 0),
      {
        role: 'user',
        parts: [{ text: userMessage }],
      },
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          systemInstruction: {
            parts: [{ text: getSystemInstruction(language) }],
          },
          generationConfig: {
            temperature: 0.7,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API route upstream error:', response.status, errorText);
      res.status(200).json({ text: getFallbackMessage(language), configured: true });
      return;
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part?.text ?? '')
      .join('')
      .trim();

    res.status(200).json({
      text: text || getFallbackMessage(language),
      configured: true,
    });
  } catch (error) {
    console.error('Gemini API route failed:', error);
    res.status(200).json({ text: getFallbackMessage(language), configured: true });
  }
}
