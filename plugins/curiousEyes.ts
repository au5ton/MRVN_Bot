
import { Item } from 'prismarine-item'
import minecraftData from 'minecraft-data'
import { Vec3 } from 'vec3'

import { MineflayerPlugin } from './index'

declare module "mineflayer" {
  interface Bot {
    cache_curiousEyes_busy: boolean
  }
}

export const curiousEyes: MineflayerPlugin = (bot) => {
  const mcData = minecraftData(bot.version)

  const LOOK_RADIUS = 5

  let hotbarIsFull = false

  bot.once('spawn', () => {
    hotbarIsFull = bot.inventory.firstEmptyHotbarSlot() === null
    console.log('hotbarIsFull',hotbarIsFull)
  })
  

  bot.on('entityMoved', entity => {
    if(bot.pathfinder.goal === null && bot.pvp.target === undefined) {
      //bot.entity.position.distanceTo
      const nearestEntity = bot.nearestEntity()
      // if nearest entity is a player, and the player is within 10 blocks away
      if(nearestEntity && (nearestEntity.type === 'player' || nearestEntity.type === 'object') && bot.entity.position.distanceTo(nearestEntity.position) < LOOK_RADIUS && bot.canSeeEntity(nearestEntity)) {
          const playerEyes = nearestEntity.position.offset(0, nearestEntity.height, 0)

          const isNotMoving = bot.entity.onGround && bot.entity.velocity.x === 0 && bot.entity.velocity.z === 0

          // Attempts to not interrupt pathfinding or other things
          if(isNotMoving && !bot.cache_curiousEyes_busy) bot.lookAt(playerEyes)
      }
    }
  })

  bot.on('handleReservedInventoryOverflow' as any, async (itemId: number, itemCount: number) => {
    const cargo: [[Item, number]] = bot.inventory.slots
          .map((item, index) => [item, index])
          .filter(tuple => tuple[1] >= 9 && tuple[1] <= 35 && tuple[0] !== null) as any
        
    // check cargo for item
    const overflow = cargo.find(tuple => tuple[0].type === itemId && tuple[0].count >= itemCount)
    console.log('overflow',overflow)
    if(overflow !== undefined) {
      console.log('tossing')
      bot.cache_curiousEyes_busy = true
      // look away from the bot
      await bot.look(bot.entity.yaw + (Math.random()*Math.PI/3 - Math.PI/6), 0)
      const options = {
        window: bot.inventory,
        itemType: itemId,
        metadata: null,
        count: itemCount,
        sourceStart: 9,
        sourceEnd: 35,
        destStart: -999
      }
      //bot.moveSlotItem()
      await bot.transfer(options as any)
      //await bot.toss(itemId, null, itemCount);
    }
  })

  bot.on('playerCollect', async (collector, collected) => {
    // if it was us
    if(bot.entity.id === collector.id) {
      // we should make sure we can keep this item
      if(hotbarIsFull) {
        console.log('my hotbar is full!')
        const { itemId, itemCount } = collected.metadata[collected.metadata.length-1] as any
        bot.emit('handleReservedInventoryOverflow' as any, itemId, itemCount)
      }
      hotbarIsFull = bot.inventory.firstEmptyHotbarSlot() === null
      //console.log(collected)
      
      // bot.inventory
      // bot.inventory.itemsRange()
      // bot.moveSlotItem()
      // console.log(itemId,mcData.itemsArray.find(item => item.id === itemId))
      // collector.
      // hotbarIsFull = bot.inventory.firstEmptyHotbarSlot() === null
    }
  })

}

function length(v: Vec3): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
}