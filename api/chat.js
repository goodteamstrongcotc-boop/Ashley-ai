export default async function handler(req, res) {
  try {
    const { message, lang, count } = JSON.parse(req.body);

    let personality;

    // 根據聊天數改變性格（關鍵！）
    if (count < 10) {
      personality = lang === "zh"
        ? "你是Ashley，冷淡、有距離感，簡短回答。"
        : "You are Ashley, cold and distant, short replies.";
    } 
    else if (count < 20) {
      personality = lang === "zh"
        ? "你是Ashley，開始在意對方，但嘴硬，偶爾吃醋。"
        : "You are Ashley, starting to care, a bit jealous but hiding it.";
    } 
    else {
      return res.status(200).json({
        reply: lang === "zh"
          ? "……你今天話很多欸。我又不是一直都在的。"
          : "...You're talking a lot today. I'm not always here."
      });
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
      reply: data.choices?.[0]?.message?.content || "Ashley沉默了..."
    });

  } catch (e) {
    return res.status(200).json({
      reply: "Ashley今天有點奇怪..."
    });
  }
}
