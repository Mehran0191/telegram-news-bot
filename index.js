Mehran🌱:
export default { async scheduled(event, env, ctx) { ctx.waitUntil(handleNews(env)); }, async fetch(request, env, ctx) { await handleNews(env); return new Response("OK"); }, };
async function handleNews(env) { const rssFeeds = [ { name: "هوش مصنوعی و فناوری", url: "https://techcrunch.com/category/artificial-intelligence/feed/" }, { name: "سئو و بهینه‌سازی", url: "https://www.searchenginejournal.com/feed/" }, { name: "توسعه‌دهندگان گوگل", url: "https://feeds.feedburner.com/GoogleDevelopersBlog" }, { name: "برنامه‌نویسی و وب", url: "https://dev.to/feed" } ];
const randomFeed = rssFeeds[Math.floor(Math.random() * rssFeeds.length)];
try { const response = await fetch(randomFeed.url); const xmlText = await response.text();

const titleMatch = xmlText.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/);
const linkMatch = xmlText.match(/<link>(.*?)<\/link>/);

if (titleMatch && linkMatch) {
  const title = titleMatch[1] || titleMatch[2];
  const link = linkMatch[1];

  const message = `🔔 **خبر تازه در حوزه: ${randomFeed.name}**\n\n📌 **${title}**\n\n🔗 مطالعه خبر:\n${link}`;

  const botToken = "8577888214:AAGOyRw5m60EdKCrI9qK-PMwN7uy0ctXz7Q";
  const chatId = "@Avishannews";

  const url = "https://api.telegram.org/bot" + botToken + "/sendMessage";
  
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "Markdown",
    }),
  });
}
} catch (error) { console.error("Error:", error); } }
