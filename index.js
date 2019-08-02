require('dotenv').config()
const TelegramBot = require("node-telegram-bot-api");
const ogs = require("open-graph-scraper");
// const firebase = require("firebase");
const {sitesRef, bookmarksRef} = require('./firebase_config')
// initialise telegram bot
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

let siteUrl;

bot.onText(/\/bookmark (.+)/, (msg, match) => {
  siteUrl = match[1];
  bot.sendMessage(
    msg.chat.id,
    "Alright friend, What category does this bookmark belong to?",
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Development",
              callback_data: "SET development"
            },
            {
              text: "Music",
              callback_data: "SET music"
            },
            {
              text: "Cute monkeys",
              callback_data: "SET cute-monkeys"
            }
          ]
        ]
      }
    }
  );
});

bot.onText(/\/getBookMarks/, (msg, match) => {
  siteUrl = match[1];
  bot.sendMessage(msg.chat.id, "What category would you like to get?", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Development",
            callback_data: "GET development"
          },
          {
            text: "Music",
            callback_data: "GET music"
          },
          {
            text: "Cute monkeys",
            callback_data: "GET cute-monkeys"
          }
        ]
      ]
    }
  });
});

bot.on("callback_query", callbackQuery => {
  const message = callbackQuery.message;
  const userId = callbackQuery.from.id;
  const keyboardResponse = callbackQuery.data.split(" ")[1];
  if (callbackQuery.data.split(" ")[0] === "SET") {
    ogs({ url: siteUrl }, function(error, results) {
      if (results.success) {
        sitesRef.push().set({
          name: results.data.ogSiteName,
          title: results.data.ogTitle,
          description: results.data.ogDescription,
          url: siteUrl,
          thumbnail: results.data.ogImage.url,
          category: keyboardResponse,
          index: `${userId}-${keyboardResponse}`,
          userId
        });
        bot.sendMessage(
          message.chat.id,
          'Added "' +
            results.data.ogTitle +
            '" to category "' +
            callbackQuery.data +
            '"!'
        );
      } else {
        sitesRef.push().set({
          url: siteUrl
        });
        bot.sendMessage(
          message.chat.id,
          "Added new website, but there was no OG data!"
        );
      }
    });
  }
  if (callbackQuery.data.split(" ")[0] === "GET") {
    const query = sitesRef
      .orderByChild("index")
      .equalTo(`${userId}-${keyboardResponse}`);
    query.on("value", snapshot => {
      const data = snapshot.val();
      if (!data) {
        bot.sendMessage(message.chat.id, "No bookmarks in this category");
        return;
      }
      const urls = Object.keys(data)
        .map(item => data[item].url)
        .join("\r\n");
      return bot.sendMessage(message.chat.id, urls);
    });
  }
});
