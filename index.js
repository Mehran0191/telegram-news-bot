export default { async scheduled(event, env, ctx) { ctx.waitUntil(handleNews(env)); }, async fetch(request, env, ctx) { await handleNews(env); return new Response("OK - Full Persian News Active"); }, };
async function handleNews(env) { const rssFeeds = [ { name: "هوش مصنوعی و فناوری", url: "https://techcrunch.com/category/artificial-intelligence/feed/" }, { name: "سئو و بهینه‌سازی", url: "https://www.searchenginejournal.com/feed/" }, { name: "توسعه‌دهندگان گوگل", url: "https://feeds.feedburner.com/GoogleDevelopersBlog" }, { name: "برنامه‌نویسی و وب", url: "https://dev.to/feed" } ];
const randomFeed = rssFeeds[Math.floor(Math.random() * rssFeeds.length)];
try { const response = await fetch(randomFeed.url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" } }); const xmlText = await response.text();
// جدا کردن بخش اولین مقاله واقعی (<item>)
const itemMatch = xmlText.match(/<item[\s\S]*?>([\s\S]*?)<\/item>/i);

if (itemMatch && itemMatch[1]) {
  const itemContent = itemMatch[1];

  // استخراج عنوان
  const titleMatch = itemContent.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
  // استخراج لینک
  const linkMatch = itemContent.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);
  // استخراج متن خلاصه
  const descMatch = itemContent.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i);

  if (titleMatch && linkMatch) {
    let rawTitle = cleanText(titleMatch[1]);
    let link = cleanText(linkMatch[1]);
    let rawDesc = descMatch ? cleanText(descMatch[1]) : "";

    // خلاصه‌سازی متن به ۲۵۰ کاراکتر
    if (rawDesc.length > 250) {
      rawDesc = rawDesc.substring(0, 250) + "...";
    }

    // ترجمه تیتر و خلاصه خبر به فارسی
    const translatedTitle = await translateToPersian(rawTitle);
    const translatedDesc = rawDesc ? await translateToPersian(rawDesc) : "";

    let message = `🔥 **خبر تازه - ${randomFeed.name}**\n\n📌 **${translatedTitle}**\n\n`;
    if (translatedDesc) {
      message +=
 📝 **خلاصه خبر:**\n${translatedDesc}\n\n;

    }
    message +=
 🔗 **مطالعه کامل خبر:**\n${link};


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
// تابع پاک‌سازی تگ‌های اضافی XML و HTML function cleanText(text) { if (!text) return ""; return text .replace(/<![CDATA[/g, "") .replace(/]]>/g, "") .replace(/</?[^>]+(>|$)/g, "") .replace(/ /g, " ") .replace(/&/g, "&") .replace(/</g, "<") .replace(/>/g, ">") .replace(/"/g, '"') .trim(); }
// تابع ترجمه به فارسی async function translateToPersian(text) { if (!text) return ""; try { const apiUrl = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=fa&dt=t&q=" + encodeURIComponent(text); const res = await fetch(apiUrl); const data = await res.json(); if (data && data[0]) { return data[0].map(function(item) { return item[0]; }).join(''); } } catch (e) { console.error("Translation error:", e); } return text; }
