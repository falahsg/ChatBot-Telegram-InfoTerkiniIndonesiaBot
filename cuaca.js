require("dotenv").config();

const cuaca = /^\/cuaca$/;
const cuacaResponse = /^\/cuaca (.+)$/;

const register = (bot) => {
  bot.onText(cuaca, (callback) => {
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
    } catch (error) {
      console.error("Error fetching weather data:", error);
      await bot.deleteMessage(callback.chat.id, loadingMessage.message_id);
      bot.sendMessage(
        callback.chat.id,
        "Maaf, terjadi kesalahan saat mengambil data cuaca atau lokasi tidak ditemukan.😭"
      );
    }
  });

  bot.on("message", async (msg) => {
    if (
      msg.text &&
      !msg.text.startsWith("/cuaca") &&
      !msg.text.startsWith("/gempa") &&
      !msg.text.startsWith("/")
    ) {
      const location = msg.text;
      let loadingMessage;
      try {
        loadingMessage = await bot.sendMessage(
          msg.chat.id,
          "Data sedang diambil..."
        );

        const WEATHER_ENDPOINT = `http://api.weatherapi.com/v1/current.json?key=5b15c1d2e637432ab4c73244242304&q=${encodeURIComponent(
          location
        )}&aqi=no`;
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

        await bot.deleteMessage(msg.chat.id, loadingMessage.message_id);
        bot.sendPhoto(msg.chat.id, fullIconUrl, {
          caption: result,
        });
      } catch (error) {
        console.error("Error fetching weather data:", error);
        await bot.deleteMessage(msg.chat.id, loadingMessage.message_id);
        bot.sendMessage(
          msg.chat.id,
          "Maaf, terjadi kesalahan saat mengambil data cuaca atau lokasi tidak ditemukan."
        );
      }
    }
  });
};

module.exports = { register };
