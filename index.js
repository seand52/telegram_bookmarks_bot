require("dotenv").config();
const bot = require("./config/telegram_config");
const ogs = require("open-graph-scraper");
const { sitesRef} = require("./config/firebase_config");
const Logic = require("./logic/logic");
const services = new Logic();

let siteUrl;

bot.onText(/\/bookmark (.+)/, (msg, match) => {
  siteUrl = match[1];
  bot.sendMessage(
    msg.chat.id,
    "Alright friend, What category does this bookmark belong to?",
    {
      reply_markup: {
        inline_keyboard: services.getCategories("SET")
      }
    }
  );
});

bot.onText(/\/getBookMarks/, (msg, match) => {
  siteUrl = match[1];
  bot.sendMessage(msg.chat.id, "What category would you like to get?", {
    reply_markup: {
      inline_keyboard: services.getCategories("GET")
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
        services.setBookMarkData(sitesRef, {
          results,
          siteUrl,
          keyboardResponse,
          userId
        });
        bot.sendMessage(
          message.chat.id,
          `Added ${results.data.ogTitle} to category ${callbackQuery.data}!`
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
