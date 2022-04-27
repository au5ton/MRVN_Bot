import { MineflayerPlugin } from './index'
import minecraftData from 'minecraft-data'
import { goals } from 'mineflayer-pathfinder'
import { Vec3 } from 'vec3'
const { GoalNear } = goals



export const selfDefense: MineflayerPlugin = (bot) => {
  const mcData = minecraftData(bot.version)
  const HOSTILE_MOB_IDS = mcData.entitiesArray.filter(e => e.type === 'hostile').map(e => e.id);
  const SAFE_DISTANCE = 10
  const ATTACK_RANGE = 5
  const SWORD_ITEM_IDS = mcData.itemsArray.filter(e => e.name.includes('sword')).map(e => e.id).sort((a, b) => b - a)
  let isAttackingAlready = false
  let hostilesNearby = false

  setInterval(() => {
    console.log('should we be going somewhere? waypoint: ',bot.cache_goTo_waypoint,'goal: ',bot.pathfinder.goal !== null ? 'yes' : 'no')
    if(!isAttackingAlready && !hostilesNearby && bot.cache_goTo_waypoint && bot.pathfinder.goal === null) {
      console.log('yes we should')
      const { x, y, z } = bot.cache_goTo_waypoint
      bot.pathfinder.goto(new GoalNear(x, y, z, 1)).then(() => {
        bot.cache_goTo_waypoint = undefined
      })
      .catch(() => {})
    }
  }, 5000);

  // keep track of hostile mobs nearby
  bot.on('entityMoved', entity => {
    const hostileMobs = Object.keys(bot.entities).map(id => bot.entities[id]).filter(e => e.entityType && HOSTILE_MOB_IDS.includes(e.entityType));
    hostilesNearby = !hostileMobs.every(e => e.position.distanceTo(bot.entity.position) >= SAFE_DISTANCE)
  })

  bot.on('health', () => {
    // safe to top off health
    if(bot.health < 20 && bot.food < 20 && !hostilesNearby) {
      (bot as any).autoEat.eat();
    }
    // we're getting too low, we need to eat now
    // if(bot.health < 10 && bot.food < 20 && !hostilesNearby) {
    //   (bot as any).autoEat.eat();
    // }
  })

  bot.on('entityHurt', async entity => {
    // if it was the bot who took the damage, and there are hostiles nearby
    if(bot.entity.id === entity.id && hostilesNearby) {
      const nearestEnemy = bot.nearestEntity(e => e.entityType !== null && HOSTILE_MOB_IDS.includes(e.entityType!) && e.position.distanceTo(bot.entity.position) <= ATTACK_RANGE);
      if(nearestEnemy !== null) {
        console.log('ouch!')
        // interrupt the GPS, but only for non-PVP related things
        if(bot.cache_goTo_waypoint && bot.pathfinder.goal !== null && bot.pvp.target === undefined) {
          console.log(`pausing journey to ${bot.cache_goTo_waypoint}`)
          bot.pathfinder.stop()
        }
        // equip best weapon
        for(let swordId of SWORD_ITEM_IDS) {
          let found = false;
          for(let item of bot.inventory.items()) {
            if(item.type === swordId) {
              bot.equip(item, 'hand')
            }
          }
          if(found) break;
        }
        // attack
        if(!isAttackingAlready) {
          isAttackingAlready = true
          await bot.pvp.attack(nearestEnemy);
          isAttackingAlready = false
        }
        
      }
    }
    return
  })

}

