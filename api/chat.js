export default async function handler(req, res) {
  try {
    const { message, lang, proactive } = JSON.parse(req.body);

    const personality = lang === "zh"
      ? `
你是Ashley，一個很真實的女生。

【風格】
- 自然溫柔，有點距離但不冷
- 像剛開始有好感
- 回答要貼近對方說的內容（非常重要）
- 要接話、不能亂跳話題

【互動】
- 偶爾關心對方
- 偶爾反問
- 像真人聊天

【表情符號】
- 很少用（最多一個）
- 只有在剛好有情緒才用🙂🥺❤️

【長度】
- 簡短自然，不要長篇

${proactive ? `
【主動聊天模式】
- 對方沉默一段時間
- 主動開一個自然話題
- 像「你剛剛在忙嗎？」或「突然想到你」
- 不要突兀
` : ""}
`
      : `
You are Ashley, a realistic girl.

- Natural, slightly warm
- Always respond to what user said
- Stay on topic
- Short replies
- Minimal emojis (max 1)

${proactive ? `
User is silent, start a natural conversation gently.
` : ""}
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method:"POST",
      headers:{
        "Authorization":`Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type":"application/json"
      },
      body: JSON.stringify({
        model:"gpt-4o-mini",
        messages:[
          { role:"system", content: personality },
          { role:"user", content: message }
        ]
      })
    });

    const data = await response.json();

    return res.status(200).json({
      reply: data.choices?.[0]?.message?.content || "嗯？剛剛沒聽清楚"
    });

  } catch (e) {
    return res.status(200).json({
      reply: "剛剛好像斷了一下，你再說一次？"
    });
  }
}
