import 'dotenv/config'
import * as mineflayer from 'mineflayer'
import { pathfinder } from 'mineflayer-pathfinder'
import autoEat from 'mineflayer-auto-eat'
import armorManager from 'mineflayer-armor-manager'

import { CommandProcessor } from './commands/CommandProcessor'
import { comeHere } from './commands'
import { curiousEyes } from './plugins'

console.log('Bot starting')

const bot = mineflayer.createBot({
  host: 'localhost',
  port: 25565,
  username: process.env.MICROSOFT_LOGIN!,
  password: process.env.MICROSOFT_PASSWORD,
  auth: 'microsoft'
})

// 3rd party plugins
bot.loadPlugin(pathfinder)
bot.loadPlugin(autoEat)
bot.loadPlugin(armorManager)
// custom plugins
bot.loadPlugin(curiousEyes)

// bot.on('chat', (username, message) => {
//   if (username === bot.username) return
//   bot.chat(message)
// })

bot.once('spawn', () => {
  const commandProcessor = new CommandProcessor();
  commandProcessor.registerCommand({
    name: 'come here',
    run: comeHere
  })

  bot.on('whisper', (username, message) => {
    if (username === bot.username) return
    commandProcessor.processCommand(bot, username, message);
  })
})

bot.on('kicked', console.log);
bot.on('error', console.log);