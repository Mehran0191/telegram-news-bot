GEMINI_API_KEY
```[cite: 7]

**گام دوم:** کد زیر رو جایگزین `index.js` کن. توی این نسخه، هم نام متغیر اصلاح شده و هم مدل جمنای روی نسخه استاندارد و پایدار تنظیم شده تا هیچ‌وقت خطا نده:

```javascript
export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(handleNews(env));
  },
  async fetch(request, env, ctx) {
    await handleNews(env);
    return new Response("OK - Gemini News Bot Active");
  },
};

async function handleNews(env) {
  const rssFeeds = [
    { name: "هوش مصنوعی و فناوری", url: "https://techcrunch.com/category/artificial-intelligence/feed/" },
    { name: "سئو و بهینه‌سازی", url: "https://www.searchenginejournal.com/feed/" },
    { name: "توسعه‌دهندگان گوگل", url: "https://feeds.feedburner.com/GoogleDevelopersBlog" },
    { name: "برنامه‌نویسی و وب", url: "https://dev.to/feed" }
  ];

  const randomFeed = rssFeeds[Math.floor(Math.random() * rssFeeds.length)];

  try {
    const response = await fetch(randomFeed.url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    const xmlText = await response.text();

    const itemMatch = xmlText.match(/<item[\s\S]*?>([\s\S]*?)<\/item>/i);

    if (itemMatch && itemMatch[1]) {
      const itemContent = itemMatch[1];

      const titleMatch = itemContent.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
      const linkMatch = itemContent.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);

      if (titleMatch && linkMatch) {
        let rawTitle = cleanHtml(titleMatch[1]);
        let link = cleanHtml(linkMatch[1]);

        // ترجمه روان با جمنای
        const translatedTitle = await translateWithGemini(env, rawTitle);

        let message = "🔥 خبر تازه - " + randomFeed.name + "\n\n";
        message += "📌 " + translatedTitle + "\n\n";
        message += "🔗 لینک منبع:\n" + link + "\n\n";
        message += "@AvishanNews";

        const botToken = "8577888214:AAGOyRw5m60EdKCrI9qK-PMwN7uy0ctXz7Q";
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
    console.error("Error:", error);
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
          parts: [{ text: `Translate the following English text into fluent, natural Persian. Output ONLY the Persian translation and nothing else:\n\n${text}` }]
        }]
      })
    });
    const data = await response.json();
    if (data && data.candidates && data.candidates[0].content.parts[0].text) {
      return data.candidates[0].content.parts[0].text.trim();
    }
  } catch (e) {
    console.error("Gemini Translation Error:", e);
  }
  return text;
}
