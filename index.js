export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(handleNews(env));
  },
  async fetch(request, env, ctx) {
    await handleNews(env);
    return new Response("OK - Bot Executed Successfully");
  },
};

async function handleNews(env) {
  // منابع معتبر، فعال و پربازدید تکنولوژی و سئو
  const rssFeeds = [
    { name: "فناوری و هوش مصنوعی (TechCrunch)", url: "https://techcrunch.com/feed/" },
    { name: "اخبار داغ تکنولوژی (The Verge)", url: "https://www.theverge.com/rss/index.xml" },
    { name: "سئو و بهینه‌سازی (Search Engine Land)", url: "https://searchengineland.com/feed" },
    { name: "نرم‌افزار و برنامه‌نویسی (Ars Technica)", url: "https://feeds.arstechnica.com/arstechnica/index" }
  ];

  const randomFeed = rssFeeds[Math.floor(Math.random() * rssFeeds.length)];

  try {
    const response = await fetch(randomFeed.url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
    });
    const xmlText = await response.text();

    const itemMatch = xmlText.match(/<item[\s\S]*?>([\s\S]*?)<\/item>/i) || xmlText.match(/<entry[\s\S]*?>([\s\S]*?)<\/entry>/i);

    if (itemMatch && itemMatch[1]) {
      const itemContent = itemMatch[1];

      const titleMatch = itemContent.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
      const linkMatch = itemContent.match(/<link(?:[\s\S]*?href=["']([\s\S]*?)["'])?(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);

      if (titleMatch) {
        let rawTitle = cleanHtml(titleMatch[1]);
        let link = linkMatch ? (linkMatch[1] || cleanHtml(linkMatch[2])) : "";

        // ترجمه دقیق با Gemini API
        let translatedTitle = await translateWithGemini(env, rawTitle);

        let message = "🔥 **خبر تازه - " + randomFeed.name + "**\n\n";
        message += "📌 **" + translatedTitle + "**\n\n";
        if (link) {
          message += "🔗 **لینک مطالعه کامل:**\n" + link + "\n\n";
        }
        message += "@AvishanNews";

        // توکن جدید ربات تلگرام
        const botToken = "8615663585:AAEDIgdeqi3h14snlAlgzS_nCmaEI2ntc8w";
        const chatId = "@Avishannews";

        await fetch("https://api.telegram.org/bot" + botToken + "/sendMessage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
          }),
        });
      }
    }
  } catch (error) {
    console.error("Main Execution Error:", error);
  }
}

function cleanHtml(text) {
  if (!text) return "";
  return text
    .replace(/<!\[CDATA\[/g, "") .replace(/\]\]>/g, "")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/<\/?[^>]+(>|$)/g, "")
    .trim();
}

async function translateWithGemini(env, text) {
  if (!text || !env.GEMINI_API_KEY) return text;
  
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `Translate the following tech news headline into smooth, natural Persian. Return ONLY the translation:\n\n${text}` }]
        }]
      })
    });
    
    const data = await response.json();
    if (data && data.candidates && data.candidates[0].content.parts[0].text) {
      return data.candidates[0].content.parts[0].text.trim();
    }
  } catch (e) {
    console.error("Gemini Error:", e);
  }
  return text;
}
