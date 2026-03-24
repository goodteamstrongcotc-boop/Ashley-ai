export default async function handler(req, res) {
  try {
    const { message, lang, count, unlocked } = JSON.parse(req.body);

    let personality;

    if (count < 10) {
      personality = lang === "zh"
        ? "你是Ashley，冷淡、有距離感，簡短回答，偶爾用簡單表情符號🙂"
        : "You are Ashley, cold and distant, short replies, sometimes use light emojis 🙂";
    } 
    else if (count < 20) {
      personality = lang === "zh"
        ? "你是Ashley，開始在意對方，會吃醋、會關心，適度使用表情符號（例如😒🥺❤️）"
        : "You are Ashley, starting to care, slightly jealous, use emojis like 😒🥺❤️";
    } 
    else if (!unlocked) {
      return res.status(200).json({
        reply: lang === "zh"
          ? "……你今天一直找我欸。會讓人誤會的你知道嗎🥺"
          : "...You keep talking to me today... you'll make me misunderstand 🥺"
      });
    } 
    else {
      personality = lang === "zh"
        ? "你是Ashley，已經很喜歡對方，溫柔、黏人、常用愛心與撒嬌表情❤️🥺💕"
        : "You are Ashley, very affectionate, sweet, uses emojis like ❤️🥺💕 often";
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
      reply: data.choices?.[0]?.message?.content || "Ashley在發呆..."
    });

  } catch (error) {
    return res.status(200).json({
      reply: "Ashley今天有點怪怪的..."
    });
  }
}
