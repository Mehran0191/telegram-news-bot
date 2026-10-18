export default { async scheduled(event, env, ctx) { ctx.waitUntil(handleNews(env)); }, async fetch(request, env, ctx) { await handleNews(env); return new Response("OK - Article Bot Active"); }, };
async function handleNews(env) { const rssFeeds = [ { name: "هوش مصنوعی و فناوری", url: "https://techcrunch.com/category/artificial-intelligence/feed/" }, { name: "سئو و بهینه‌سازی", url: "https://www.searchenginejournal.com/feed/" }, { name: "توسعه‌دهندگان گوگل", url: "https://feeds.feedburner.com/GoogleDevelopersBlog" }, { name: "برنامه‌نویسی و وب", url: "https://dev.to/feed" } ];
const randomFeed = rssFeeds[Math.floor(Math.random() * rssFeeds.length)];
try { const response = await fetch(randomFeed.url, { headers: { "User-Agent": "Mozilla/5.0" } }); const xmlText = await response.text();
// استخراج دقیق اولین مقاله (<item>) برای اینکه حتماً تیتر خود مقاله خوانده شود و نه نام سایت
const itemMatch = xmlText.match(/<item>([\s\S]*?)<\/item>/i);

if (itemMatch) {
  const itemContent = itemMatch[1];
  const titleMatch = itemContent.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
  const linkMatch = itemContent.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);

  if (titleMatch && linkMatch) {
    let rawTitle = titleMatch[1].replace(/<\/?[^>]+(>|$)/g, "").trim();
    let link = linkMatch[1].trim();

    // ترجمه دقیق تیتر اصلی مقاله به فارسی
    const translatedTitle = await translateToPersian(rawTitle);

    const message = "🔥 **خبر تازه - " + randomFeed.name + "**\n\n📌 **" + translatedTitle + "**\n\n🔗 **لینک مقاله اصلی:**\n" + link;

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
} catch (error) { console.error("Error:", error); } }
async function translateToPersian(text) { try { const apiUrl = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=fa&dt=t&q=" + encodeURIComponent(text); const res = await fetch(apiUrl); const data = await res.json(); if (data && data[0]) { var translated = ""; for (var i = 0; i < data[0].length; i++) { if (data[0][i][0]) { translated += data[0][i][0]; } } return translated; } } catch (e) { console.error(e); } return text; }
