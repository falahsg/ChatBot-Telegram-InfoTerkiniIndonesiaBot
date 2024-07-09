require("dotenv").config();

const cuaca = /^\/cuaca$/;
const cuacaResponse = /^\/cuaca (.+)$/;
const gempa = /^\/gempa$/;
const berita = /^\/berita$/;
const start = /^\/start$/;
const help = /^\/help$/;

const register = (bot) => {
  let waitingForLocation = {};

  bot.onText(cuaca, (callback) => {
    waitingForLocation[callback.chat.id] = true;
    bot.sendMessage(
      callback.chat.id,
      "Silahkan ketikkan kota/negara yang anda inginkan."
    );
  });

  bot.onText(cuacaResponse, async (callback, match) => {
    const location = match[1];
    let loadingMessage;
    try {
      loadingMessage = await bot.sendMessage(
        callback.chat.id,
        "Data sedang diambil...Loading ↻"
      );

      const WEATHER_ENDPOINT = `http://api.weatherapi.com/v1/current.json?key=${
        process.env.WEATHER_API_KEY
      }&q=${encodeURIComponent(location)}&aqi=no`;
      const apiCall = await fetch(WEATHER_ENDPOINT);
      const data = await apiCall.json();

      if (!data.location) {
        throw new Error("Location not found");
      }

      const {
        location: { name, region, country, localtime },
        current: {
          temp_c,
          condition: { text, icon },
        },
      } = data;

      const fullIconUrl = `https:${icon}`;
      const result = `
- Lokasi: ${name}, ${region}, ${country}
- Waktu: ${localtime}
- Suhu: ${temp_c}°C
- Cuaca: ${text}

/start 🔄
      `;

      await bot.deleteMessage(callback.chat.id, loadingMessage.message_id);
      bot.sendPhoto(callback.chat.id, fullIconUrl, {
        caption: result,
      });
      waitingForLocation[callback.chat.id] = false;
    } catch (error) {
      console.error("Error fetching weather data:", error);
      await bot.deleteMessage(callback.chat.id, loadingMessage.message_id);
      bot.sendMessage(
        callback.chat.id,
        "Maaf, terjadi kesalahan saat mengambil data cuaca atau lokasi tidak ditemukan.😭"
      );
      waitingForLocation[callback.chat.id] = false;
    }
  });

  bot.on("message", async (msg) => {
    if (waitingForLocation[msg.chat.id] && !msg.text.startsWith("/")) {
      const location = msg.text;
      let loadingMessage;
      try {
        loadingMessage = await bot.sendMessage(
          msg.chat.id,
          "Data sedang diambil..."
        );

        const WEATHER_ENDPOINT = `http://api.weatherapi.com/v1/current.json?key=${
          process.env.WEATHER_API_KEY
        }&q=${encodeURIComponent(location)}&aqi=no`;
        const apiCall = await fetch(WEATHER_ENDPOINT);
        const data = await apiCall.json();

        if (!data.location) {
          throw new Error("Lokasi tidak ditemukkan");
        }

        const {
          location: { name, region, country, localtime },
          current: {
            temp_c,
            condition: { text, icon },
          },
        } = data;

        const fullIconUrl = `https:${icon}`;
        const result = `
- Lokasi: ${name}, ${region}, ${country}
- Waktu: ${localtime}
- Suhu: ${temp_c}°C
- Cuaca: ${text}

/start 🔄
        `;

        await bot.deleteMessage(msg.chat.id, loadingMessage.message_id);
        bot.sendPhoto(msg.chat.id, fullIconUrl, {
          caption: result,
        });
        waitingForLocation[msg.chat.id] = false;
      } catch (error) {
        console.error("Error fetching weather data:", error);
        await bot.deleteMessage(msg.chat.id, loadingMessage.message_id);
        bot.sendMessage(
          msg.chat.id,
          `Maaf, terjadi kesalahan saat mengambil data cuaca atau lokasi tidak ditemukan. 
          
Silahkan ulangi /cuaca dengan lokasi yang anda inginkan.`
        );
        waitingForLocation[msg.chat.id] = false;
      }
    } else if (
      !msg.text.startsWith("/gempa") &&
      !msg.text.startsWith("/berita") &&
      !msg.text.startsWith("/start") &&
      !msg.text.startsWith("/help") &&
      !msg.text.startsWith("/cuaca")
    ) {
      bot.sendMessage(
        msg.chat.id,
        `Command anda salah, Klik salah satu dibawah ini untuk melihat informasi

/berita 📰 — Menampilkankan berita terbaru
/cuaca ☁️ — Menampilkan informasi cuaca
/gempa 💥 — Menampilkan informasi gempa

/help 🆘 — Menampilkan informasi bot`
      );
    }
  });
};

module.exports = { register };
