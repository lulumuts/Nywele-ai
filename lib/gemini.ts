import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize only if API key is available (allows build to succeed)
const apiKey = process.env.GEMINI_API_KEY;

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null as any;

// Use gemini-pro for text generation (gemini-1.5-flash doesn't exist in v1beta)
export const geminiModel = genAI ? genAI.getGenerativeModel({ model: 'gemini-pro' }) : null as any;

export default geminiModel;