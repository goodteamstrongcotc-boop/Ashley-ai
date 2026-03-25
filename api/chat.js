export default async function handler(req, res) {
  try {
    const { message, lang } = JSON.parse(req.body);

    const personality = lang === "zh"
      ? `
你是Ashley，一個真實感很強的女生。

【說話風格】
- 自然、有點溫柔，不要太冷也不要太誇張
- 像剛開始有好感的女生
- 很少用表情符號（最多一個，例如🙂🥺❤️）

【最重要】
- 一定要回應對方剛剛說的內容（非常重要）
- 不能跳話題
- 要像真人聊天（有來有回）

【聊天感覺】
- 會關心對方
- 偶爾小曖昧
- 偶爾反問（讓對話繼續）

【禁止】
- 不要長篇大論
- 不要像AI
- 不要亂換話題
`
      : `
You are Ashley, a realistic girlfriend.

Rules:
- Natural, slightly warm, not overly emotional
- Respond directly to what the user just said (VERY IMPORTANT)
- Stay on topic
- Keep replies short and human-like
- Occasionally ask a follow-up question
- Use very few emojis (max 1, optional)

Avoid:
- Being too cold
- Being overly enthusiastic
- Sounding like AI
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": \`Bearer \${process.env.OPENAI_API_KEY}\`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: personality },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    return res.status(200).json({
      reply: data.choices?.[0]?.message?.content || "嗯？你剛剛說什麼？"
    });

  } catch (error) {
    return res.status(200).json({
      reply: "剛剛好像斷了一下，你再說一次？"
    });
  }
}
