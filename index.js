export default { async scheduled(event, env, ctx) { ctx.waitUntil(handleNews(env)); }, async fetch(request, env, ctx) { await handleNews(env); return new Response("OK - News Bot Active"); }, };
async function handleNews(env) { const rssFeeds = [ { name: "هوش مصنوعی و فناوری", url: "https://techcrunch.com/category/artificial-intelligence/feed/" }, { name: "سئو و بهینه‌سازی", url: "https://www.searchenginejournal.com/feed/" }, { name: "توسعه‌دهندگان گوگل", url: "https://feeds.feedburner.com/GoogleDevelopersBlog" }, { name: "برنامه‌نویسی و وب", url: "https://dev.to/feed" } ];
const randomFeed = rssFeeds[Math.floor(Math.random() * rssFeeds.length)];
try { const response = await fetch(randomFeed.url, { headers: { "User-Agent": "Mozilla/5.0" } }); const xmlText = await response.text();
const itemMatch = xmlText.match(/<item[\s\S]*?>([\s\S]*?)<\/item>/i);

if (itemMatch && itemMatch[1]) {
  const itemContent = itemMatch[1];

  const titleMatch = itemContent.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
  const linkMatch = itemContent.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);
  const descMatch = itemContent.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i);

  if (titleMatch && linkMatch) {
    let rawTitle = cleanTextSimple(titleMatch[1]);
    let link = cleanTextSimple(linkMatch[1]);
    let rawDesc = descMatch ? cleanTextSimple(descMatch[1]) : "";

    if (rawDesc.length > 250) {
      rawDesc = rawDesc.substring(0, 250) + "...";
    }

    const translatedTitle = await translateToPersian(rawTitle);
    const translatedDesc = rawDesc ? await translateToPersian(rawDesc) : "";

    let message = "🔥 **خبر تازه - " + randomFeed.name + "**\n\n";
    message += "📌 **" + translatedTitle + "**\n\n";
    
    if (translatedDesc) {
      message += "📝 **خلاصه خبر:**\n" + translatedDesc + "\n\n";
    }
    
    message += "🔗 **مطالعه کامل مقاله:**\n" + link;

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
function cleanTextSimple(text) { if (!text) return ""; let cleaned = text .split("<![CDATA[").join("")
.split("]]>").join("") .split("’").join("'") .split("‘").join("'") .split("“").join('"') .split("”").join('"') .split("'").join("'") .split(""").join('"') .split("&").join("&") .split("<").join("<") .split(">").join(">");
let result = ""; let insideTag = false; for (let i = 0; i < cleaned.length; i++) { if (cleaned[i] === "<") { insideTag = true; } else if (cleaned[i] === ">") { insideTag = false; } else if (!insideTag) { result += cleaned[i]; } } return result.trim(); }
async function translateToPersian(text) { if (!text) return ""; try { const apiUrl = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=fa&dt=t&q=" + encodeURIComponent(text); const res = await fetch(apiUrl); const data = await res.json(); if (data && data[0]) { return data[0].map(item => item[0]).join(""); } } catch (e) { console.error("Translation Error:", e); } return text; }
