import { prisma } from "@prisma/client";
import { Api, Bot, Context, RawApi } from "grammy";
import projectService from "../services/project.service";



let bot: Bot<Context, Api<RawApi>>;
export async function init() {
    // console.log(process.env.TELEGRAM_TOKEN);
    console.log("Starting bot");

    bot = new Bot(process.env.TELEGRAM_TOKEN!);
    // bot.catch((e) => console.log(e))
    bot.start();
    await bot.init()
    console.log("Telegram bot started", bot.botInfo.username);

    bot.command("start", (ctx) => {        
        ctx.reply(`your channel id is ${ctx.update.channel_post?.sender_chat.id}, please input this into your settings in trofos.`)
    })

}

export async function sendToProject(projectId: number, message: string) {
    const result = await projectService.getTelegramId(projectId);
    if (result == null || result.telegramChannelLink == null) {
        return
    }
    bot.api.sendMessage(result.telegramChannelLink, message)
}