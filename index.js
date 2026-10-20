export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(handleNews(env));
  },
  async fetch(request, env, ctx) {
    await handleNews(env);
    return new Response("OK - Mixed News Bot Active");
  },
};

async function handleNews(env) {
  // منابع ترکیبی (با وزن بیشتر روی منابع ایرانی)
  const rssFeeds = [
    // منابع ایرانی (سهم بیشتر)
    { name: "زومیت", url: "https://www.zoomit.ir/feed/" },
    { name: "دیجیاتو", url: "https://digiato.com/feed" },
    { name: "دیجی‌کالا مگ", url: "https://www.digikala.com/mag/feed/" },
    { name: "زومجی (گیم و فناوری)", url: "https://www.zoomg.ir/feed/" },
    { name: "تریبون (سئو و دیجیتال مارکتینگ)", url: "https://www.triboon.net/blog/feed/" },
    
    // منابع خارجی (برای تنوع و پوشش اخبار جهانی)
    { name: "تک‌کرانچ (خارجی)", url: "https://techcrunch.com/feed/" },
    { name: "د ورج (خارجی)", url: "https://www.theverge.com/rss/index.xml" }
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

      if (titleMatch) {
        let title = cleanHtml(titleMatch[1]);
        let link = linkMatch ? (linkMatch[1] || cleanHtml(linkMatch[2])) : "";

        let message = "🔥 **خبر تازه - " + randomFeed.name + "**\n\n";
        message += "📌 **" + title + "**\n\n";
        if (link) {
          message += "🔗 **مطالعه کامل خبر:**\n" + link + "\n\n";
        }
        message += "@AvishanNews";

        // توکن ربات تلگرام
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
