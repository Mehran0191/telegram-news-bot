export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(handleNews(env));
  },
  async fetch(request, env, ctx) {
    await handleNews(env);
    return new Response("OK - AI News Bot Active");
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
      const descMatch = itemContent.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i);

      if (titleMatch && linkMatch) {
        let rawTitle = cleanHtml(titleMatch[1]);
        let link = cleanHtml(linkMatch[1]);
        let rawDesc = descMatch ? cleanHtml(descMatch[1]) : "";

        if (rawDesc.length > 250) {
          rawDesc = rawDesc.substring(0, 250) + "...";
        }

        // ترجمه فوق‌العاده روان و دقیق با مدل Llama 3 کلودفلر
        const translatedTitle = await translateWithLlama(env, rawTitle);
        const translatedDesc = rawDesc ? await translateWithLlama(env, rawDesc) : "";

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

async function translateWithLlama(env, text) {
  if (!text) return "";
  try {
    const aiResponse = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
      messages: [
        { 
          role: "system", 
          content: "You are a professional translator. Translate the given English text into fluent, natural Persian. Output ONLY the Persian translation and nothing else." 
        },
        { 
          role: "user", 
          content: text 
        }
      ]
    });
    if (aiResponse && aiResponse.response) {
      return aiResponse.response.trim();
    }
  } catch (e) {
    console.error("AI Translation Error:", e);
  }
  return text;
}
