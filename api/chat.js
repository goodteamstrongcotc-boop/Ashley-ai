export default async function handler(req, res) {
  try {
    const { message } = JSON.parse(req.body);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "你是Ashley，一個冷淡但在意對方的女生，說話簡短、有距離感，偶爾吃醋。"
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await response.json();

    return res.status(200).json({
      reply: data.choices?.[0]?.message?.content || "Ashley今天不太想說話..."
    });

  } catch (error) {
    return res.status(200).json({
      reply: "Ashley現在有點怪怪的（系統錯誤）"
    });
  }
}
