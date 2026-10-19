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

  for (const feed of rssFeeds) {
    try {
      const response = await fetch(feed.url, {
        headers: { "User-Agent": "Mozilla/5.0" }
      });
      const xmlText = await response.text();

      // پیدا کردن اولین آیتم معتبر از هر فید برای ارسال
      const itemMatch = xmlText.match(/<item[\s\S]*?>([\s\S]*?)<\/item>/i);

      if (itemMatch && itemMatch[1]) {
        const itemContent = itemMatch[1];

        const titleMatch = itemContent.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
        const linkMatch = itemContent.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);

        if (titleMatch && linkMatch) {
          let rawTitle = cleanText(titleMatch[1]);
          let link = cleanText(linkMatch[1]);

          let message = "🔥 خبر تازه - " + feed.name + "\n\n";
          message += "📌 " + rawTitle + "\n\n";
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
          
          // کمی فاصله بین ارسال از فیدهای مختلف
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    } catch (error) {
      console.error("Error fetching feed:", error);
    }
  }
}

function cleanText(text) {
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
