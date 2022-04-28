import { Movements, goals } from 'mineflayer-pathfinder'
const { GoalNear } = goals
import minecraftData from 'minecraft-data'
import { Vec3 } from 'vec3'

import { CommandHandler } from './CommandProcessor'
import { extractCoordinates } from './goTo'

export const depositChest: CommandHandler = async (bot, username, message) => {
  const mcData = minecraftData(bot.version)
  const defaultMove = new Movements(bot, mcData as any)
  defaultMove.allowSprinting = !message.includes('slowly')

  bot.cache_curiousEyes_busy = true

  const destination = extractCoordinates(message)

  if (!destination) {
    bot.whisper(username, `I don't understand where you want me to go`)
    bot.cache_curiousEyes_busy = false
    return
  }
  else {
    bot.cache_goTo_waypoint = destination
  }

  bot.pathfinder.setMovements(defaultMove)
  const { x, y, z } = destination
  try {
    await bot.pathfinder.goto(new GoalNear(x, y, z, 1));
    const CHEST_BLOCKS = ['chest', 'ender_chest', 'trapped_chest'];
    const chestToOpen = bot.findBlock({
      matching: CHEST_BLOCKS.map(name => mcData.blocksByName[name].id),
      maxDistance: 2
    });
    if(!chestToOpen) {
      bot.whisper(username, `I can't find your chest.`)
      bot.cache_curiousEyes_busy = false
      return
    }
    await bot.lookAt(chestToOpen.position)
    const chest = await bot.openChest(chestToOpen)

    // must be single chest
    if(bot.currentWindow?.slots.length !== 63) {
      bot.whisper(username, `I will only work with single chests.`)
      bot.cache_curiousEyes_busy = false
      return
    }
    // See: https://wiki.vg/Inventory#Chest
    const INDEX = 1
    const ITEM = 0
    const empty_chest_slots: number[] = bot.currentWindow?.slots
      .map((item, index) => [item, index])
      .filter(tuple => tuple[INDEX] >= 0 && tuple[INDEX] <= 26 && tuple[ITEM] === null)
      .map(tuple => tuple[INDEX] as number);
    //console.log('empty_chest_slots',empty_chest_slots)
    const occupied_cargo_slots: number[] = bot.currentWindow?.slots
      .map((item, index) => [item, index])
      .filter(tuple => tuple[INDEX] >= 27 && tuple[INDEX] <= 53 && tuple[ITEM] !== null)
      .map(tuple => tuple[INDEX] as number);
    //console.log('occupied_cargo_slots',occupied_cargo_slots)
    if(empty_chest_slots.length === 0) {
      bot.whisper(username, `This chest is already full.`)
      bot.cache_curiousEyes_busy = false
      return
    }

    if(occupied_cargo_slots.length > empty_chest_slots.length) {
      bot.whisper(username, `This chest doesn't have enough slots for my cargo.`)
      bot.cache_curiousEyes_busy = false
      return
    }

    let i = 0
    for(let cargoSlot of occupied_cargo_slots) {
      await bot.moveSlotItem(cargoSlot, empty_chest_slots[i])
      i++
    }

    bot.whisper(username, `I deposited ${i} slots into the chest at ${chestToOpen.position}`)
    bot.cache_curiousEyes_busy = false
    return
  }
  catch(err) {
    //
  }
}
