import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function generateInsights(prompt: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating insights:', error);
    throw new Error('Failed to generate AI insights');
  }
}

export async function generateStructuredInsights<T>(
  prompt: string,
  schema: string
): Promise<T> {
  try {
    const fullPrompt = `${prompt}\n\nRespond with valid JSON matching this schema:\n${schema}`;
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from markdown code blocks if present
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
    const jsonText = jsonMatch ? jsonMatch[1] : text;
    
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Error generating structured insights:', error);
    throw new Error('Failed to generate structured AI insights');
  }
}
