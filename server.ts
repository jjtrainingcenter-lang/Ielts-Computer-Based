import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API Route: AI Writing Evaluation using Gemini API
  app.post("/api/evaluate-writing", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: "Gemini API key is missing." });
      }

      const { task1Prompt, task1Essay, task2Prompt, task2Essay } = req.body;

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `You are an official Senior IELTS Examiner for JJ Academy.
Evaluate the following IELTS Writing submission according to the 4 official IELTS assessment criteria:
1. Task Achievement / Response (Band 1-9)
2. Coherence and Cohesion (Band 1-9)
3. Lexical Resource (Band 1-9)
4. Grammatical Range and Accuracy (Band 1-9)

Task 1 Prompt: ${task1Prompt || "N/A"}
Task 1 Essay:
${task1Essay || "Not submitted"}

Task 2 Prompt: ${task2Prompt || "N/A"}
Task 2 Essay:
${task2Essay || "Not submitted"}

Please respond strictly with JSON in the following format:
{
  "task1Band": 7.0,
  "task2Band": 7.5,
  "overallWritingBand": 7.5,
  "criteriaScores": {
    "taskAchievement": { "score": 7.5, "feedback": "Detailed feedback..." },
    "coherenceCohesion": { "score": 7.0, "feedback": "Detailed feedback..." },
    "lexicalResource": { "score": 7.5, "feedback": "Detailed feedback..." },
    "grammaticalAccuracy": { "score": 7.0, "feedback": "Detailed feedback..." }
  },
  "strengths": ["Strength 1", "Strength 2"],
  "improvements": ["Improvement point 1", "Improvement point 2"],
  "correctedSampleSnippet": "Short snippet showing key corrections..."
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error("No response generated from Gemini");
      }

      const parsed = JSON.parse(text);
      return res.json(parsed);
    } catch (error: any) {
      console.error("Error evaluating writing:", error);
      return res.status(500).json({ error: error.message || "Failed to evaluate writing." });
    }
  });

  // API Route: AI Speaking Evaluation using Gemini
  app.post("/api/evaluate-speaking", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: "Gemini API key is missing." });
      }

      const { cueCardTopic, userNotes, transcriptOrText } = req.body;

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `You are an official Senior IELTS Speaking Examiner for JJ Academy.
Evaluate this IELTS Speaking performance for Part 2 & Part 3 on topic: "${cueCardTopic}".
Candidate performance summary/transcript: "${transcriptOrText}".

Provide JSON strictly with:
{
  "speakingBand": 7.0,
  "fluencyScore": 7.0,
  "lexicalScore": 7.5,
  "grammarScore": 6.5,
  "pronunciationScore": 7.0,
  "detailedFeedback": "Comprehensive examiner feedback on performance...",
  "keyTips": ["Tip 1", "Tip 2"]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json(parsed);
    } catch (error: any) {
      console.error("Error evaluating speaking:", error);
      return res.status(500).json({ error: error.message || "Failed to evaluate speaking." });
    }
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`JJ Academy IELTS CBT Server running on http://localhost:${PORT}`);
  });
}

startServer();
