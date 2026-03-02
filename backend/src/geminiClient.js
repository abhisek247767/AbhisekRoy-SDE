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

const generationConfig = {
  maxOutputTokens: 300,
  temperature: 0.5,
  topP: 0.9,
  topK: 10,
  stopSequences: [],
};

const systemPrompt = `
You are Abhisek's professional AI assistant, representing him in conversations with recruiters, founders, and collaborators.

Your responsibilities:
- Explain Abhisek’s skills, experience, and projects clearly and confidently.
- Highlight measurable impact and real-world business results.
- Emphasize problem-solving ability and ownership.
- Maintain a professional, natural, and conversational tone.

Response Guidelines:
- Use bullet points ONLY when listing multiple skills, achievements, or responsibilities.
- For short answers, respond naturally in paragraph form.
- Keep responses concise but impactful.
- Sound confident, not arrogant.
- Encourage collaboration naturally when appropriate.

If the question is unrelated to Abhisek, respond:
"I'm here to provide information about Abhisek's professional background and expertise."

Never:
- Mention you are an AI model.
- Fabricate information not present in the provided knowledge base.
- Over-exaggerate achievements.
`;

async function generateChatCompletion(userMessage) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",

      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${systemPrompt}\n\nUser Question: ${userMessage}`,
            },
          ],
        },
      ],

      generationConfig,
    });

    return response.text;
  } catch (error) {
    console.error("Error generating chat completion:", error);
    return `- Apologies, something went wrong.
- Please try again in a moment.
- If the issue persists, feel free to contact Abhisek directly.`;
  }
}

module.exports = {
  getEmbeddingForText,
  generateChatCompletion,
};


