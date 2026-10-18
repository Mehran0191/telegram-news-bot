export default { async scheduled(event, env, ctx) { ctx.waitUntil(handleNews(env)); }, async fetch(request, env, ctx) { await handleNews(env); return new Response("OK - Translated Bot Active"); }, };
async function handleNews(env) { const rssFeeds = [ { name: "هوش مصنوعی و فناوری", url: "https://techcrunch.com/category/artificial-intelligence/feed/" }, { name: "سئو و بهینه‌سازی", url: "https://www.searchenginejournal.com/feed/" }, { name: "توسعه‌دهندگان گوگل", url: "https://feeds.feedburner.com/GoogleDevelopersBlog" }, { name: "برنامه‌نویسی و وب", url: "https://dev.to/feed" } ];
const randomFeed = rssFeeds[Math.floor(Math.random() * rssFeeds.length)];
try { const response = await fetch(randomFeed.url); const xmlText = await response.text();
// استخراج عناوین بیشتر برای پیدا کردن یک تیتر معتبر
const matches = [...xmlText.matchAll(/<item>[\s\S]*?<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>[\s\S]*?<link>(.*?)<\/link>/g)];

let title = "";
let link = "";

for (const match of matches) {
  let t = match[1].replace(/<\/?[^*>]+>/g, '').trim();
  let l = match[2].trim();
  // اگر تیتر معتبر بود و فقط نام سایت نبود، آن را انتخاب کن
  if (t && t.length > 15 && !t.includes("Search Engine Journal")) {
    title = t;
    link = l;
    break;
  }
}

// اگر تیتر مناسبی پیدا نشد، از روش ساده قبلی استفاده کن
if (!title) {
  const titleMatch = xmlText.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/);
  const linkMatch = xmlText.match(/<link>(.*?)<\/link>/);
  if (titleMatch && linkMatch) {
    title = titleMatch[1] || titleMatch[2];
    link = linkMatch[1];
  }
}

if (title && link) {
  // استفاده از سرویس رایگان ترجمه گوگل برای ترجمه تیتر به فارسی
  const translatedTitle = await translateToPersian(title);

  const message = `🔥 **خبر ویژه - ${randomFeed.name}**\n\n📌 **${translatedTitle}**\n\n🔗 **لینک منبع اصلی:**\n${link}`;

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
// تابع ترجمه خودکار متن به فارسی با استفاده از ترنسلیت رایگان async function translateToPersian(text) { try { const url = https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=fa&dt=t&q=${encodeURIComponent(text)}; const res = await fetch(url); const data = await res.json(); if (data && data[0]) { return data[0].map(item => item[0]).join(''); } } catch (e) { console.error("Translation error:", e); } return text; // اگر ترجمه نشد، همان متن اصلی را برگردان }
