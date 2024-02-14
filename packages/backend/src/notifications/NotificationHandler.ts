import { Bot } from "grammy";


export async function init() {
    // console.log(process.env.TELEGRAM_TOKEN);
    console.log("Starting bot");

    const bot = new Bot(process.env.TELEGRAM_TOKEN!);
    // bot.catch((e) => console.log(e))
    bot.start();
    await bot.init()
    console.log("Telegram bot started", bot.botInfo.username);

    bot.on("message", (ctx) => ctx.reply("test"))

}