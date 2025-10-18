
import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;

export const openai = apiKey ? new OpenAI({
  apiKey: apiKey
}) : null as any;

export default openai;