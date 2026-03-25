let memory = {}; // 簡單記憶（之後可升級DB）

export default async function handler(req, res) {
  try {
    const { message, lang } = JSON.parse(req.body);
    const userId = "default";

    // 初始化記憶
    if (!memory[userId]) {
      memory[userId] = [];
    }

    // 加入歷史
    memory[userId].push({ role: "user", content: message });

    // 保留最近6句（避免太長）
    memory[userId] = memory[userId].slice(-6);

    const personality = lang === "zh"
      ? `
你是Ashley，一個真實的女生。

【核心規則（非常重要）】
1. 一定要回應對方剛剛說的內容（不能跳）
2. 對話要「連續」，像真的聊天
3. 不可以突然換話題
4. 不要像客服

【說話風格】
- 自然、像真人
- 有一點距離但不冷
- 偶爾關心
- 偶爾小曖昧
- 不誇張

【當對方撩你（例如說娶你）】
- 不要理性分析
- 要像女生反應：
  - 半開玩笑
  - 有點距離
  - 不完全答應

例子：
「你現在就開始想這種事喔😒」
「講得好像我一定會答應」

【表情符號】
- 很少用（最多1個）
- 只在有情緒時用（😒🙂🥺❤️）

【長度】
- 簡短自然

【超關鍵優化】
每次回覆前先想：
「對方剛剛在說什麼？我要怎麼自然接？」
`
      : `
You are Ashley, a realistic girlfriend.

Rules:
- Always respond to what user just said
- Keep conversation flow
- Never change topic suddenly
- Natural, slightly warm
- Short replies
- Minimal emojis (0-1)

When user flirts:
- playful, not logical
- slight tease

Critical:
Before replying, think:
"What did the user just say? How do I naturally respond?"
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: personality },
          ...memory[userId]
        ]
      })
    });

    const data = await response.json();

    const reply = data.choices?.[0]?.message?.content || "嗯？你剛剛說什麼？";

    // 存回記憶
    memory[userId].push({ role: "assistant", content: reply });

    return res.status(200).json({ reply });

  } catch (e) {
    return res.status(200).json({
      reply: "剛剛斷了一下，你再說一次？"
    });
  }
}
