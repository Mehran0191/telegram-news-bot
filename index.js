export default { async scheduled(event, env, ctx) { ctx.waitUntil(handleNews(env)); }, async fetch(request, env, ctx) { await handleNews(env); return new Response("OK"); }, };
async function handleNews(env) { const rssFeeds = [ { name: "هوش مصنوعی و فناوری", url: "https://techcrunch.com/category/artificial-intelligence/feed/" }, { name: "سئو و بهینه‌سازی", url: "https://www.searchenginejournal.com/feed/" }, { name: "توسعه‌دهندگان گوگل", url: "https://feeds.feedburner.com/GoogleDevelopersBlog" }, { name: "برنامه‌نویسی و وب", url: "https://dev.to/feed" } ];
const randomFeed = rssFeeds[Math.floor(Math.random() * rssFeeds.length)];
try { const response = await fetch(randomFeed.url, { headers: { "User-Agent": "Mozilla/5.0" } }); const xmlText = await response.text();
const titleMatch = xmlText.match(/<title>(.*?)<\/title>/);
const linkMatch = xmlText.match(/<link>(.*?)<\/link>/);

if (titleMatch && linkMatch) {
  let rawTitle = titleMatch[1].replace("<![CDATA[", "").replace("]]>", "").trim();
  let link = linkMatch[1].trim();

  const translatedTitle = await translateToPersian(rawTitle);

  const message = "🔥 **خبر تازه - " + randomFeed.name + "**\n\n📌 **" + translatedTitle + "**\n\n🔗 **لینک منبع:**\n" + link;

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
} catch (error) { console.error(error); } }
async function translateToPersian(text) { try { const apiUrl = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=fa&dt=t&q=" + encodeURIComponent(text); const res = await fetch(apiUrl); const data = await res.json(); if (data && data[0]) { var translated = ""; for (var i = 0; i < data[0].length; i++) { if (data[0][i][0]) { translated += data[0][i][0]; } } return translated; } } catch (e) { console.error(e); } return text; }
