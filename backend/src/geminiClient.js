const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn(
    'GEMINI_API_KEY is not set. Set it in a .env file in the backend folder before running the server.'
  );
}

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const EMBEDDING_MODEL = 'models/text-embedding-004';
const CHAT_MODEL = 'models/gemini-1.5-flash';

async function getEmbeddingForText(text) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const url = `${GEMINI_BASE_URL}/${EMBEDDING_MODEL}:embedContent?key=${GEMINI_API_KEY}`;

  const body = {
    content: {
      parts: [{ text }]
    }
  };

  const response = await axios.post(url, body);

  const embedding =
    response.data &&
    response.data.embedding &&
    response.data.embedding.values;

  if (!embedding) {
    throw new Error('Failed to get embedding from Gemini API');
  }

  return embedding;
}

async function generateChatCompletion(prompt) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const url = `${GEMINI_BASE_URL}/${CHAT_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const body = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ]
  };

  const response = await axios.post(url, body);

  const candidates = response.data && response.data.candidates;
  if (!candidates || !candidates.length) {
    throw new Error('No candidates returned from Gemini chat API');
  }

  const parts = candidates[0].content && candidates[0].content.parts;
  if (!parts || !parts.length) {
    throw new Error('No parts returned from Gemini chat API');
  }

  const textParts = parts
    .map((p) => (typeof p.text === 'string' ? p.text : ''))
    .filter(Boolean);

  return textParts.join('\n').trim();
}

module.exports = {
  getEmbeddingForText,
  generateChatCompletion
};


