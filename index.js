export default { async scheduled(event, env, ctx) { ctx.waitUntil(handleNews(env)); }, async fetch(request, env, ctx) { await handleNews(env); return new Response("OK - Translated Bot Active"); }, };
async function handleNews(env) { const rssFeeds = [ { name: "هوش مصنوعی و فناوری", url: "https://techcrunch.com/category/artificial-intelligence/feed/" }, { name: "سئو و بهینه‌سازی", url: "https://www.searchenginejournal.com/feed/" }, { name: "توسعه‌دهندگان گوگل", url: "https://feeds.feedburner.com/GoogleDevelopersBlog" }, { name: "برنامه‌نویسی و وب", url: "https://dev.to/feed" } ];
const randomFeed = rssFeeds[Math.floor(Math.random() * rssFeeds.length)];
try { const response = await fetch(randomFeed.url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" } }); const xmlText = await response.text();
// دریافت اولین عنوان و لینک معتبر خبر
const itemMatch = xmlText.match(/<item>[\s\S]*?<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>/i);

if (itemMatch && itemMatch[1] && itemMatch[2]) {
  let rawTitle = itemMatch[1].replace(/<\/?[^>]+(>|$)/g, "").trim();
  let link = itemMatch[2].trim();

  // ترجمه تیتر خبر به فارسی
  const translatedTitle = await translateToPersian(rawTitle);

  const message = `🔥 **خبر تازه - ${randomFeed.name}**\n\n📌 **${translatedTitle}**\n\n🔗 **مطالعه کامل خبر:**\n${link}`;

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
async function translateToPersian(text) { try { const url = https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=fa&dt=t&q=${encodeURIComponent(text)}; const res = await fetch(url); const data = await res.json(); if (data && data[0]) { return data[0].map(item => item[0]).join(''); } } catch (e) { console.error("Translation error:", e); } return text; }
