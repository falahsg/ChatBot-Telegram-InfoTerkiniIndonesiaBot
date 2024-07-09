const gempa = /^\/gempa$/;

const register = (bot) => {
  bot.onText(gempa, async (callback) => {
    let loadingMessage;
    try {
      loadingMessage = await bot.sendMessage(
        callback.chat.id,
        "Data sedang diambil...Loading ↻"
      );

      const BMKG_ENDPOINT = "https://data.bmkg.go.id/DataMKG/TEWS/";
      const apiCall = await fetch(BMKG_ENDPOINT + "autogempa.json");
      const {
        Infogempa: {
          gempa: {
            Jam,
            Magnitude,
            Tanggal,
            Wilayah,
            Potensi,
            Kedalaman,
            Shakemap,
            Coordinates,
          },
        },
      } = await apiCall.json();
      const BMKG_ENDPOINT_IMG = BMKG_ENDPOINT + Shakemap;

      const result = `
- Waktu: ${Jam} || ${Tanggal}
- Besaran: ${Magnitude} SR
- Wilayah: ${Wilayah}
- Kedalaman: ${Kedalaman}
- Koordinat: ${Coordinates}
- Potensi: ${Potensi}

/start 🔄
      `;

      const response = await fetch(BMKG_ENDPOINT_IMG);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      await bot.deleteMessage(callback.chat.id, loadingMessage.message_id);
      bot.sendPhoto(callback.chat.id, BMKG_ENDPOINT_IMG, {
        caption: result,
      });
    } catch (error) {
      console.error("Error fetching gempa data:", error);
      if (loadingMessage) {
        await bot.deleteMessage(callback.chat.id, loadingMessage.message_id);
      }
      bot.sendMessage(
        callback.chat.id,
        "Maaf, terjadi kesalahan saat mengambil data gempa.😭"
      );
    }
  });
};

module.exports = { register };
