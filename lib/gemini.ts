import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize only if API key is available (allows build to succeed)
const apiKey = process.env.GEMINI_API_KEY;

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null as any;

export const geminiModel = genAI ? genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }) : null as any;

export default geminiModel;