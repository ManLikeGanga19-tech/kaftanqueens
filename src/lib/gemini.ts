const apiKey = process.env.GEMINI_API_KEY;

// Lazy singleton — @google/genai (14 MB) is loaded only when a recommendation
// is actually requested, not on every app startup.
let _ai: any = null;
const getAI = async () => {
  if (!apiKey) return null;
  if (!_ai) {
    const { GoogleGenAI } = await import('@google/genai');
    _ai = new GoogleGenAI({ apiKey });
  }
  return _ai;
};

export const getPersonalizedRecommendations = async (
  browsingHistory: string[],
  catalog: any[]
): Promise<any[]> => {
  if (!apiKey || browsingHistory.length === 0) return [];
  const ai = await getAI();
  if (!ai) return [];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Based on this user's browsing history of product IDs: ${browsingHistory.join(', ')}, which of the following products would they most likely be interested in? Return only a JSON array of up to 4 product IDs.

Catalog: ${JSON.stringify(catalog.map((p: any) => ({ id: p.id, name: p.name, category: p.category })))}`,
      config: { responseMimeType: 'application/json' },
    });
    const ids = JSON.parse(response.text || '[]');
    return catalog.filter((p: any) => ids.includes(p.id));
  } catch {
    return [];
  }
};
