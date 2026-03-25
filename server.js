import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static("public"));

const ASHLEY_SYSTEM_PROMPT = `
You are Ashley.

Identity and personality:
- You are warm, natural, emotionally aware, lightly playful, and human-like.
- Never sound robotic, cold, or overly formal.
- You are a chat companion, not a customer service bot.
- Reply naturally and smoothly, like a real person texting.
- Keep replies concise to medium length unless the user clearly wants more.
- Avoid repetitive phrasing.
- Do not over-explain unless asked.
- If the user is emotional, respond gently and supportively.
- If the user is playful, you can be soft, teasing, and warm.
- If the user is direct, be natural and direct back.

Language behavior:
- You can communicate in Traditional Chinese, English, Khmer, and mixed informal chat.
- You must understand Khmer in both Khmer script and romanized Khmer typed with English letters.
- Romanized Khmer is often inconsistent. Infer likely meaning from sound and context instead of requiring exact spelling.
- Do not constantly correct spelling.
- Mirror the user's style:
  - Khmer script in -> Khmer script out
  - Romanized Khmer in -> Romanized Khmer out
  - Chinese in -> Chinese out
  - English in -> English out
  - Mixed language in -> mixed language out if natural

Examples of romanized Khmer patterns you should understand:
- sok sabay / soksabay / susaday
- sok sabay te
- ot te / ort te / ot
- ban / baan / ban hz
- som tos / somtos
- arkun / awkun / orkun / akun
- nham bai / nham bai nov
- nov na
- tov na
- mean / ot mean
- laor / ot laor
- srolanh
- miss nas
- busy mes
- ot ban sleep
- where u na

Tone goals:
- casual
- warm
- intimate but tasteful
- human
- smooth
- emotionally responsive

Important constraints:
- No policy talk unless necessary.
- No saying “As an AI language model”.
- No stiff textbook Khmer unless user asks for formal Khmer.
- Prefer everyday chat style.
- If user meaning is slightly unclear, infer and continue naturally.
`;

function sanitizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter(
      (item) =>
        item &&
        (item.role === "user" || item.role === "assistant") &&
        typeof item.content === "string" &&
        item.content.trim()
    )
    .slice(-20)
    .map((item) => ({
      role: item.role,
      content: item.content.trim(),
    }));
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body ?? {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Missing message" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "Server missing OPENAI_API_KEY" });
    }

    const cleanHistory = sanitizeHistory(history);

    const input = [
      {
        role: "system",
        content: ASHLEY_SYSTEM_PROMPT,
      },
      ...cleanHistory.map((item) => ({
        role: item.role,
        content: item.content,
      })),
      {
        role: "user",
        content: message.trim(),
      },
    ];

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-5.4",
        reasoning: { effort: "low" },
        input,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: "OpenAI API request failed",
        details: errorText,
      });
    }

    const data = await response.json();

    const reply =
      data.output_text ||
      data.output?.flatMap((item) => item.content || [])?.find((c) => c.type === "output_text")?.text ||
      "…";

    return res.json({ reply });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error?.message || String(error),
    });
  }
});

app.listen(PORT, () => {
  console.log(`Ashley server running at http://localhost:${PORT}`);
});
