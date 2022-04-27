
import { CommandHandler } from './CommandProcessor'

export const whereAreYou: CommandHandler = async (bot, username, message) => {
  bot.whisper(username, `I am located at: ${bot.entity.position}`)
}
