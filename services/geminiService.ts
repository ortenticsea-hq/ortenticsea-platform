type ChatHistoryEntry = {
  role: 'user' | 'model';
  parts: { text: string }[];
};

const getFallbackMessage = (language: 'pidgin' | 'english') =>
  language === 'pidgin'
    ? 'Abeg, assistant no dey available right now. Try again shortly.'
    : 'The assistant is unavailable right now. Please try again shortly.';

export const getOAssistResponse = async (
  userMessage: string,
  language: 'pidgin' | 'english',
  chatHistory: ChatHistoryEntry[] = []
) => {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userMessage,
        language,
        chatHistory,
      }),
    });

    if (!response.ok) {
      console.error('Gemini API route failed:', response.status, response.statusText);
      return getFallbackMessage(language);
    }

    const data = await response.json();
    return typeof data?.text === 'string' && data.text.trim()
      ? data.text
      : getFallbackMessage(language);
  } catch (error) {
    console.error('Gemini request failed:', error);
    return getFallbackMessage(language);
  }
};
