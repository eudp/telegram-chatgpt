const TelegramBot = require("node-telegram-bot-api");
const { fork } = require("node:child_process");

const token = process.env.TELEGRAM_TOKEN;

const bot = new TelegramBot(token, { polling: true });

let chats = [];
bot.on("message", (msg) => {
  const indexChat = chats.findIndex((chat) => chat.id === msg.chat.id);

  if (indexChat > -1) {
    chats[indexChat].child.send(msg.text);
    return;
  }

  const child = fork("chatgpt.js", [msg.chat.id, msg.text]);

  child.on("message", function (message) {
    bot.sendMessage(message.chatId, message.text);
  });

  chats.push({ id: msg.chat.id, child });
});

bot.on("polling_error", console.error);
