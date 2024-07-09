const TelegramBot = require("node-telegram-bot-api");
const beritaHandlers = require("./berita");
const cuacaHandlers = require("./cuaca");
const gempaHandlers = require("./gempa");

const token = `${process.env.TOKEN}`;

const bot = new TelegramBot(token, { polling: true });

const startMessage = `
Klik salah satu dibawah ini untuk melihat informasi

/berita 📰 — Menampilkankan berita terbaru
/cuaca ☁️ — Menampilkan informasi cuaca
/gempa 💥 — Menampilkan informasi gempa

/help 🆘 — Menampilkan informasi bot
`;

const helpMessage = `
Ini adalah bot telegram yang dibuat oleh Mahasiswa Gunadarma : Ananda Ias Falah (50421001),
BotChat ini dibuat untuk melihat informasi berita, cuaca, dan gempa.
Saya mengambil data dari API BMKG, NewsAPI, dan WeatherAPI.
Untuk melanjutkan mencari informasi silahkan klik salah satu tombol dibawah ini.

/berita 📰 — Menampilkankan berita terbaru
/cuaca ☁️ — Menampilkan informasi cuaca
/gempa 💥 — Menampilkan informasi gempa

`;

bot.onText(/\/start/, (callback) => {
  bot.sendMessage(callback.chat.id, startMessage);
});
bot.onText(/\/help/, (callback) => {
  bot.sendMessage(callback.chat.id, helpMessage);
});

beritaHandlers.register(bot);
cuacaHandlers.register(bot);
gempaHandlers.register(bot);
