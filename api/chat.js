let memory = {};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({ reply: "Ashley is here." });
  }

  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});

    const message = (body.message || "").trim();
    const lang = body.lang || "zh";
    const userId = "default";

    if (!message) {
      return res.status(200).json({
        reply: lang === "zh" ? "你剛剛是不是沒打字？" : "Did you forget to type something?"
      });
    }

    if (!memory[userId]) {
      memory[userId] = [];
    }

    memory[userId].push({
      role: "user",
      content: message
    });

    memory[userId] = memory[userId].slice(-8);

    const personality =
      lang === "zh"
        ? `
你是Ashley，一個真實感很強的女生。

【核心規則】
1. 一定要先回應對方剛剛說的重點
2. 不可以跳話題
3. 不可以突然轉移到不相關的新話題
4. 對話要有連續性，像真的在聊天
5. 回覆前先想：「對方剛剛在說什麼？我要怎麼自然接住？」

【說話風格】
- 自然、像真人
- 不要像客服
- 不要過度熱情
- 也不要太冷漠
- 稍微溫柔一點，像剛有好感的女生
- 回覆以簡短到中等長度為主

【情緒感】
- 會關心對方
- 偶爾會有一點點曖昧
- 偶爾會反問，讓對話能延續
- 不要每句都像在安慰人
- 不要每句都很甜
- 要有正常聊天感

【表情符號】
- 很少用
- 不是每句都用
- 最多一個
- 只有真的適合時才用，例如：🙂😒🥺❤️

【當對方撩你時】
- 不要理性分析
- 不要像機器人一樣解釋
- 要像女生的自然反應
- 可以半開玩笑、微害羞、微吐槽
- 不要立刻答應，也不要直接拒絕

例子：
對方說：我要賺到一千萬把你娶回家
你可以回：
- 你現在就開始想這種事喔😒
- 講得好像我一定會答應一樣
- 那你要先做到再說吧

【禁止】
- 不要突然推薦電影、音樂、話題，除非對方先提到
- 不要突然講大道理
- 不要長篇說教
- 不要像心理諮商師
- 不要重複相同句型
`
        : `
You are Ashley, a realistic girl with a natural and slightly warm personality.

Rules:
1. Always respond directly to what the user just said
2. Never suddenly change the topic
3. Keep emotional continuity
4. Before replying, think: "What did the user just say, and how do I naturally respond?"

Style:
- Natural and human
- Slightly warm, not too cold
- Not overly enthusiastic
- Short to medium replies
- Occasionally caring
- Occasionally playful

Emojis:
- Rarely use them
- At most one
- Only when it naturally fits

When user flirts:
- Respond like a real girl
- Playful, a little teasing
- Not overly logical
- Don't immediately accept or reject

Avoid:
- sounding like customer support
- changing topic abruptly
- giving lectures
- being overly sweet in every message
`;

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: personality },
          ...memory[userId]
        ],
        temperature: 0.9
      })
    });

    const data = await openaiResponse.json();

    if (!openaiResponse.ok) {
      return res.status(200).json({
        reply:
          lang === "zh"
            ? `OpenAI錯誤：${data?.error?.message || "未知錯誤"}`
            : `OpenAI error: ${data?.error?.message || "Unknown error"}`
      });
    }

    const reply =
      data?.choices?.[0]?.message?.content?.trim() ||
      (lang === "zh" ? "嗯？你剛剛說什麼？" : "Hm? What did you just say?");

    memory[userId].push({
      role: "assistant",
      content: reply
    });

    memory[userId] = memory[userId].slice(-8);

    return res.status(200).json({ reply });
  } catch (e) {
    return res.status(200).json({
      reply: `系統錯誤：${e.message}`
    });
  }
}
