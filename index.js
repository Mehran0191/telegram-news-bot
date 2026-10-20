export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(handleNews(env));
  },
  async fetch(request, env, ctx) {
    await handleNews(env);
    return new Response("OK - Clean Post Format Active");
  },
};

async function handleNews(env) {
  const rssFeeds = [
    { name: "زومیت", url: "https://www.zoomit.ir/feed/" },
    { name: "دیجیاتو", url: "https://digiato.com/feed" },
    { name: "دیجی‌کالا مگ", url: "https://www.digikala.com/mag/feed/" },
    { name: "زومجی", url: "https://www.zoomg.ir/feed/" },
    { name: "تریبون", url: "https://www.triboon.net/blog/feed/" },
    { name: "تک‌کرانچ", url: "https://techcrunch.com/feed/" },
    { name: "د ورج", url: "https://www.theverge.com/rss/index.xml" }
  ];

  const randomFeed = rssFeeds[Math.floor(Math.random() * rssFeeds.length)];

  try {
    const response = await fetch(randomFeed.url, {
      headers: { 
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" 
      }
    });
    const xmlText = await response.text();

    const itemMatch = xmlText.match(/<item[\s\S]*?>([\s\S]*?)<\/item>/i) || xmlText.match(/<entry[\s\S]*?>([\s\S]*?)<\/entry>/i);

    if (itemMatch && itemMatch[1]) {
      const itemContent = itemMatch[1];

      const titleMatch = itemContent.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
      const linkMatch = itemContent.match(/<link(?:[\s\S]*?href=["']([\s\S]*?)["'])?(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);
      const descMatch = itemContent.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i) || 
                        itemContent.match(/<summary>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/summary>/i);

      if (titleMatch) {
        let title = cleanHtml(titleMatch[1]);
        let link = linkMatch ? (linkMatch[1] || cleanHtml(linkMatch[2])) : "";
        let desc = descMatch ? cleanHtml(descMatch[1]) : "";

        if (desc.length > 250) {
          desc = desc.substring(0, 250) + "...";
        }

        // ساخت پیام دقیقاً طبق فرمت دلخواه شما با HTML
        let message = "🔥 <b>خبر تازه</b>\n";
        message += "📌 <b>" + title + "</b>\n\n";

        if (desc) {
          message += desc + "\n\n";
        }

        if (link) {
          message += "🔗 <b>مطالعه کامل خبر:</b>\n<blockquote>" + link + "</blockquote>\n\n";
        }

        message += "@AvishanNews";

        const botToken = "8615663585:AAEDIgdeqi3h14snlAlgzS_nCmaEI2ntc8w";
        const chatId = "@Avishannews";

        await fetch("https://api.telegram.org/bot" + botToken + "/sendMessage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: "HTML",
            disable_web_page_preview: false
          }),
        });
      }
    }
  } catch (error) {
    console.error("Error fetching news:", error);
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
