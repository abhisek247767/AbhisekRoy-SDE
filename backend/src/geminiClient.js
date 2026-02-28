const { GoogleGenAI } = require("@google/genai");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not set.");
}

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

async function getEmbeddingForText(text) {
  try {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: text,
  });

  return response.embeddings.values;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}

async function generateChatCompletion(prompt) {
  try {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text;
  } catch (error) {
    console.error("Error generating chat completion:", error);
    throw error;
  }
}

module.exports = {
  getEmbeddingForText,
  generateChatCompletion
};


