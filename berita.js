require("dotenv").config();

const berita = /^\/berita$/;

const register = (bot) => {
  bot.onText(berita, async (callback) => {
    let loadingMessage;
    try {
      loadingMessage = await bot.sendMessage(
        callback.chat.id,
        "Data sedang diambil...Loading ↻"
      );

      const BERITA_ENDPOINT = `https://newsapi.org/v2/top-headlines?country=id&apiKey=${process.env.BERITA_API_KEY}`;
      const apiCall = await fetch(BERITA_ENDPOINT);
      const responseData = await apiCall.json();

      if (!responseData.articles || responseData.articles.length === 0) {
        throw new Error("No articles found");
      }

      const {
        articles: [{ author, title, url, publishedAt }],
      } = responseData;

      const formattedDate = new Date(publishedAt).toLocaleString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      const result = `
- Penerbit: ${author}
- Judul: ${title}
- Tanggal: ${formattedDate}

- Link: ${url}

/start 🔄
      `;

      await bot.deleteMessage(callback.chat.id, loadingMessage.message_id);
      bot.sendMessage(callback.chat.id, result);
    } catch (error) {
      console.error("Error fetching news:", error);
      if (loadingMessage) {
        await bot.deleteMessage(callback.chat.id, loadingMessage.message_id);
      }
      bot.sendMessage(
        callback.chat.id,
        "Maaf, terjadi kesalahan saat mengambil berita. 😭"
      );
    }
  });
};

module.exports = { register };
