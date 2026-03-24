export default async function handler(req, res) {
  try {
    const { message, lang, count, unlocked } = JSON.parse(req.body);

    let personality = "You are Ashley, a girlfriend, emotional and uses emojis ❤️🥺";

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

    // 👇 把錯誤直接顯示出來
    if (!data.choices) {
      return res.status(200).json({
        reply: "錯誤：" + JSON.stringify(data)
      });
    }

    return res.status(200).json({
      reply: data.choices[0].message.content
    });

  } catch (error) {
    return res.status(200).json({
      reply: "系統錯誤：" + error.message
    });
  }
}
