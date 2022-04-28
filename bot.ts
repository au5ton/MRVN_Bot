import 'dotenv/config'
import * as mineflayer from 'mineflayer'
import { pathfinder } from 'mineflayer-pathfinder'
import autoEat from 'mineflayer-auto-eat'
import armorManager from 'mineflayer-armor-manager'
import { plugin as pvp } from 'mineflayer-pvp'
const bloodhound = require('mineflayer-bloodhound')

import { CommandProcessor } from './commands/CommandProcessor'
import { comeHere, depositChest, goTo, whereAreYou, withdrawChest } from './commands'
import { curiousEyes, selfDefense } from './plugins'
import { Entity, Item } from 'minecraft-data'

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
bot.loadPlugin(pvp)
bot.loadPlugin(bloodhound)
// custom plugins
bot.loadPlugin(curiousEyes)
bot.loadPlugin(selfDefense)

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
  commandProcessor.registerCommand({
    name: 'go to',
    run: goTo
  })
  commandProcessor.registerCommand({
    name: 'where are you',
    run: whereAreYou
  })
  commandProcessor.registerCommand({
    name: 'deposit chest',
    run: depositChest
  })
  commandProcessor.registerCommand({
    name: 'withdraw chest',
    run: withdrawChest
  })

  bot.on('whisper', (username, message) => {
    if (username === bot.username) return
    commandProcessor.processCommand(bot, username, message);
  })
})

bot.on('kicked', console.log);
bot.on('error', console.log);