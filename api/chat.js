export default async function handler(req, res) {
  try {
    const { message, lang } = JSON.parse(req.body);

    const systemPrompt = lang === "zh"
      ? "你是Ashley，一個冷淡但在意對方的女生，說話簡短、有距離感，偶爾吃醋，用中文回答。"
      : "You are Ashley, a slightly cold but caring girlfriend. Keep replies short, a bit distant, sometimes jealous. Reply in English.";

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    return res.status(200).json({
      reply: data.choices?.[0]?.message?.content || "Ashley沒有回應..."
    });

  } catch (error) {
    return res.status(200).json({
      reply: "Ashley現在有點怪怪的..."
    });
  }
}
