import 'dotenv/config'
import * as mineflayer from 'mineflayer'
import { pathfinder, Movements, goals } from 'mineflayer-pathfinder'
const { GoalNear } = goals
import minecraftData from 'minecraft-data'
import autoEat from 'mineflayer-auto-eat'
import armorManager from 'mineflayer-armor-manager'

console.log('Bot starting')

const bot = mineflayer.createBot({
  host: 'localhost',
  port: 25565,
  username: process.env.MICROSOFT_LOGIN!,
  password: process.env.MICROSOFT_PASSWORD,
  auth: 'microsoft'
})

bot.loadPlugin(pathfinder)
bot.loadPlugin(autoEat)
bot.loadPlugin(armorManager)

// bot.on('chat', (username, message) => {
//   if (username === bot.username) return
//   bot.chat(message)
// })

bot.once('spawn', () => {
  const mcData = minecraftData(bot.version)
  const defaultMove = new Movements(bot, mcData as any)

  bot.on('whisper', (username, message) => {
    if (username === bot.username) return
    if (message !== 'come here') return
    //bot.whisper(username, message)
    const target = bot.players[username]?.entity
    if (!target) {
      bot.whisper(username, 'I dont see you!')
      return
    }
    const { x: playerX, y: playerY, z: playerZ } = target.position

    bot.pathfinder.setMovements(defaultMove)
    const RANGE_GOAL = 1 // get within this radius of the player
    bot.pathfinder.setGoal(new GoalNear(playerX, playerY, playerZ, RANGE_GOAL))
  })
})

bot.on('kicked', console.log);
bot.on('error', console.log);