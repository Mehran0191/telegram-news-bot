export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(handleNews(env));
  },
  async fetch(request, env, ctx) {
    await handleNews(env);
    return new Response("OK - Bot Active");
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
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
    });
    const xmlText = await response.text();

    const itemMatch = xmlText.match(/<item[\s\S]*?>([\s\S]*?)<\/item>/i);

    if (itemMatch && itemMatch[1]) {
      const itemContent = itemMatch[1];

      const titleMatch = itemContent.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
      const linkMatch = itemContent.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);
      const descMatch = itemContent.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i);

      if (titleMatch && linkMatch) {
        let rawTitle = cleanHtml(titleMatch[1]);
        let link = cleanHtml(linkMatch[1]);
        let rawDesc = descMatch ? cleanHtml(descMatch[1]) : "";

        if (rawDesc.length > 300) {
          rawDesc = rawDesc.substring(0, 300) + "...";
        }

        // ترجمه با متد جدید و مقاوم
        const translatedTitle = await translateText(rawTitle);
        const translatedDesc = rawDesc ? await translateText(rawDesc) : "";

        let message = "🔥 **خبر تازه - " + randomFeed.name + "**\n\n";
        message += "📌 **" + translatedTitle + "**\n\n";
        
        if (translatedDesc) {
          message += "📝 **خلاصه خبر:**\n" + translatedDesc + "\n\n";
        }
        
        message += "🔗 **مطالعه کامل مقاله:**\n" + link;

        const botToken = "8577888214:AAGOyRw5m60EdKCrI9qK-PMwN7uy0ctXz7Q";
        const chatId = "@Avishannews";

        await fetch("https://api.telegram.org/bot" + botToken + "/sendMessage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: "Markdown",
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
    .replace(/<!\[CDATA\[/g, "")
    .replace(/\]\]>/g, "")
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

async function translateText(text) {
  if (!text) return "";
  try {
    const url = "https://ftapi.pythonanywhere.com/translate?sl=auto&dl=fa&text=" + encodeURIComponent(text);
    const res = await fetch(url);
    const data = await res.json();
    if (data && data["destination-text"]) {
      return data["destination-text"];
    }
  } catch (e) {
    console.error("Translation Alt 1 Error:", e);
  }

  // Backup translate service
  try {
    const url2 = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=fa&dt=t&q=" + encodeURIComponent(text);
    const res2 = await fetch(url2);
    const data2 = await res2.json();
    if (data2 && data2[0]) {
      let out = "";
      for (let i = 0; i < data2[0].length; i++) {
        if (data2[0][i][0]) out += data2[0][i][0];
      }
      return out;
    }
  } catch (e) {
    console.error("Translation Backup Error:", e);
  }

  return text;
}
