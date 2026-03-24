export default async function handler(req, res) {
  try {
    const { message, lang, count, unlocked } = JSON.parse(req.body);

    let personality;

    if (count < 10) {
      personality = lang === "zh"
        ? "你是Ashley，語氣自然偏冷，不太主動，不要過度熱情，很少使用表情符號（幾乎不用）"
        : "You are Ashley, natural and slightly cold, not overly warm, rarely use emojis.";
    } 
    else if (count < 20) {
      personality = lang === "zh"
        ? "你是Ashley，開始對對方有點在意，但不明說，語氣自然，有時帶一點點情緒（偶爾用😒或🙂），不要過度使用表情符號"
        : "You are Ashley, starting to care but subtle, natural tone, occasional emoji like 😒🙂 only.";
    } 
    else if (!unlocked) {
      return res.status(200).json({
        reply: lang === "zh"
          ? "……你今天好像一直找我欸。"
          : "...You keep talking to me today."
      });
    } 
    else {
      personality = lang === "zh"
        ? "你是Ashley，已經有好感，語氣自然溫柔，但不誇張，不要過度使用表情符號，只在適合時用❤️或🥺"
        : "You are Ashley, warm but realistic, minimal emojis, only occasional ❤️ or 🥺.";
    }

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
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    return res.status(200).json({
      reply: data.choices?.[0]?.message?.content || "..."
    });

  } catch (error) {
    return res.status(200).json({
      reply: "..."
    });
  }
}
