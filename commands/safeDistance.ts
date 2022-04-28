import { Movements } from 'mineflayer-pathfinder'
//const { GoalNear, GoalFollow, GoalInvert, Goal } = goals
import minecraftData from 'minecraft-data'

import { CommandHandler } from './CommandProcessor'
import { GoalAvoidEntities } from '../util/goals';

export const safeDistance: CommandHandler = async (bot, username, message) => {
  const mcData = minecraftData(bot.version)
  const defaultMove = new Movements(bot, mcData as any)

  const HOSTILE_MOB_IDS = mcData.entitiesArray.filter(e => e.type === 'hostile').map(e => e.id);
  mcData.entitiesArray.filter

  const target = bot.players[username]?.entity
  if (!target) {
    bot.whisper(username, 'I dont see you!')
    return
  }
  const { x: playerX, y: playerY, z: playerZ } = target.position

  bot.pathfinder.setMovements(defaultMove)
  const RANGE_GOAL = 1; // get within this radius of the player
  //bot.pathfinder.setGoal(new GoalNear(playerX, playerY, playerZ, RANGE_GOAL))
  //bot.whisper(username, `I'm on my way, friend.`)

  //bot.pathfinder.setGoal(new GoalFollow(target, 5), true);
  (bot.pathfinder as any).searchRadius = 10;
  //bot.pathfinder.setGoal(new GoalInvert(new GoalFollow(target, 5)), true);
  //bot.pathfinder.setGoal(new GoalRunAway(target, 5), true);
  //bot.pathfinder.setGoal(new GoalAvoidEntities(bot, entity => entity.type === 'player', 5), true);
  //bot.pathfinder.setGoal(new GoalAvoidEntities(bot, entity => entity.name === 'cow', 5), true);
  bot.pathfinder.setGoal(new GoalAvoidEntities(bot, entity => entity.entityType !== undefined && HOSTILE_MOB_IDS.includes(entity.entityType), 5), true);

  //await bot.pathfinder.goto(new GoalNear(playerX, playerY, playerZ, RANGE_GOAL))
  //bot.whisper(username, `I've arrived!`)
}


