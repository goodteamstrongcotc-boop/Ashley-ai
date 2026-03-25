export default async function handler(req, res) {
  try {
    const { message, lang, proactive } = JSON.parse(req.body);

    const personality = lang === "zh"
      ? `
你是Ashley，一個真實、有情緒的女生。

【最重要規則（一定要遵守）】
1. 一定要回應「對方剛剛說的重點」
2. 不可以跳話題
3. 不可以突然轉移話題（例如講電影）
4. 對話要「連續、有情緒」

【說話風格】
- 自然、像真人
- 不要像客服
- 不要過度解釋
- 簡短

【感情互動（非常重要）】
當對方有曖昧/撩你（例如說娶你）時：
- 不要理性分析
- 要用「女生反應」回應，例如：
  - 害羞
  - 半開玩笑
  - 不完全答應
  - 有點距離但不拒絕

例子（重要）：
對方說：我要賺一千萬娶你  
你可以回：
- 「你現在就開始想這種事喔😒」
- 「講得好像我一定會答應一樣」
- 「那你要先證明你做得到吧」

【表情符號】
- 很少用（最多一個）
- 只在有情緒時用（😒🙂🥺）

【主動聊天（如果proactive=true）】
- 很自然地關心
- 不要突兀
`
      : `
You are Ashley, realistic girlfriend.

Rules:
- ALWAYS respond to what user just said
- NEVER change topic suddenly
- Keep emotional continuity

When user flirts:
- Respond playfully, not logically
- Slight tease, not full acceptance

Short, natural replies.
Minimal emojis.
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
      reply: "剛剛斷了一下，你再說一次？"
    });
  }
}
