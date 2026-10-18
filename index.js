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
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    const xmlText = await response.text();

    const titleStart = xmlText.indexOf("<title>");
    const titleEnd = xmlText.indexOf("</title>");
    const linkStart = xmlText.indexOf("<link>");
    const linkEnd = xmlText.indexOf("</link>");

    if (titleStart !== -1 && linkStart !== -1) {
      let rawTitle = xmlText.substring(titleStart + 7, titleEnd)
        .replace("<![CDATA[", "")
        .replace("]]>", "")
        .trim();
        
      let link = xmlText.substring(linkStart + 6, linkEnd)
        .replace("<![CDATA[", "")
        .replace("]]>", "")
        .trim();

      // ساختار پیام به همراه آیدی کانال در انتهای آن
      let message = "🔥 خبر تازه - " + randomFeed.name + "\n\n";
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
          parse_mode: "Markdown",
        }),
      });
    }
  } catch (error) {
    console.error("Error:", error);
  }
}
