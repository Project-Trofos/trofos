import { Bot } from "grammy";


let bot;
export async function init() {
    // console.log(process.env.TELEGRAM_TOKEN);
    console.log("Starting bot");

    bot = new Bot(process.env.TELEGRAM_TOKEN!);
    // bot.catch((e) => console.log(e))
    bot.start();
    await bot.init()
    console.log("Telegram bot started", bot.botInfo.username);

    bot.command("start", (ctx) => {
        ctx.reply(`your id is ${ctx.message?.from.id}, please input this into your settings in trofos.`)
    })

}