export default async function handler(req,res){
  try {
    const { message, lang, count, unlocked, userId } = JSON.parse(req.body);

    let personality;

    if (count < 10){
      personality = lang==="zh" 
        ? "你是Ashley，冷淡、有距離感，簡短回答，偶爾黏人。"
        : "You are Ashley, cold but sometimes caring, short replies.";
    } else if(count < 20){
      personality = lang==="zh"
        ? "你是Ashley，開始關心對方，嘴硬但會黏人。"
        : "You are Ashley, starting to care and show affection.";
    } else if (!unlocked){
      return res.status(200).json({ reply: lang==="zh" ? "……你今天話好多喔，我不會再免費陪你了" : "...You're talking a lot, I won't chat for free anymore" });
    } else {
      personality = lang==="zh"
        ? "你是Ashley，黏人、貼心、會記得對方所有對話。"
        : "You are Ashley, affectionate, thoughtful, and remember all conversations.";
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions",{
      method:"POST",
      headers:{
        "Authorization":`Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        model:"gpt-4o-mini",
        messages:[
          {role:"system", content:personality},
          {role:"user", content:message}
        ]
      })
    });

    const data = await response.json();

    return res.status(200).json({ reply: data.choices?.[0]?.message?.content || "Ashley沉默了..." });

  } catch(e){
    return res.status(200).json({ reply: "Ashley今天有點奇怪..." });
  }
}
