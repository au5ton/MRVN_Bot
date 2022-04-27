import { Movements, goals } from 'mineflayer-pathfinder'
const { GoalNear } = goals
import minecraftData from 'minecraft-data'
import { Vec3 } from 'vec3'

import { CommandHandler } from './CommandProcessor'

declare module "mineflayer" {
  interface Bot {
      cache_goTo_waypoint?: Vec3
  }
}

export const goTo: CommandHandler = async (bot, username, message) => {
  const mcData = minecraftData(bot.version)
  const defaultMove = new Movements(bot, mcData as any)
  defaultMove.allowSprinting = !message.includes('slowly')
  // defaultMove.canDig = false;
  // defaultMove.scafoldingBlocks

  const destination = extractCoordinates(message)

  if (!destination) {
    bot.whisper(username, `I don't understand where you want me to go`)
    return
  }
  else {
    bot.cache_goTo_waypoint = destination
  }

  bot.pathfinder.setMovements(defaultMove)
  const RANGE_GOAL = 1
  const { x, y, z } = destination
  bot.whisper(username, `I'll start my journey to ${destination}. I'll let you know when I arrive!`);
  const start = new Date();
  start.valueOf()
  try {
    await bot.pathfinder.goto(new GoalNear(x, y, z, RANGE_GOAL));
    bot.cache_goTo_waypoint = undefined
    const end = new Date();
    const minutes = (end.valueOf() - start.valueOf()) / 1000 / 60

    bot.whisper(username, `I've arrived at ${destination}! My journey took ${minutes.toFixed(2)} minutes.`)
  }
  catch(err) {
    console.log('oops')
    //bot.whisper(username, `I ran into some trouble, I'm going to have to stop for now.`)
  }
}

export function extractCoordinates(message: string): Vec3 | null {
  const regex = /([\+\-0-9])+/g
  // 'go to 400 64 -800'
  const numbers = Array.from(message.matchAll(regex)).map(e => parseInt(e[0]))
  if(numbers.length === 3) {
    const [x, y, z] = numbers
    return new Vec3(x,y,z);
  }
  else {
    return null;
  }
}