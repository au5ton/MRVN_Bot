import { Movements, goals } from 'mineflayer-pathfinder'
const { GoalNear } = goals
import minecraftData from 'minecraft-data'

import { CommandHandler } from './CommandProcessor'

export const comeHere: CommandHandler = async (bot, username, message) => {
  const mcData = minecraftData(bot.version)
  const defaultMove = new Movements(bot, mcData as any)

  const target = bot.players[username]?.entity
  if (!target) {
    bot.whisper(username, 'I dont see you!')
    return
  }
  const { x: playerX, y: playerY, z: playerZ } = target.position

  bot.pathfinder.setMovements(defaultMove)
  const RANGE_GOAL = 1 // get within this radius of the player
  //bot.pathfinder.setGoal(new GoalNear(playerX, playerY, playerZ, RANGE_GOAL))
  bot.whisper(username, `I'm on my way, friend.`)
  await bot.pathfinder.goto(new GoalNear(playerX, playerY, playerZ, RANGE_GOAL))
  bot.whisper(username, `I've arrived!`)
}
