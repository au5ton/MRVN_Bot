import { MineflayerPlugin } from './index'
import minecraftData from 'minecraft-data'
import { Vec3 } from 'vec3'

export const curiousEyes: MineflayerPlugin = (bot) => {
  const mcData = minecraftData(bot.version)

  const LOOK_RADIUS = 5;

  bot.on('entityMoved', entity => {
    if(bot.pathfinder.goal === null && bot.pvp.target === undefined) {
      //bot.entity.position.distanceTo
      const nearestEntity = bot.nearestEntity()
      // if nearest entity is a player, and the player is within 10 blocks away
      if(nearestEntity && (nearestEntity.type === 'player' || nearestEntity.type === 'object') && bot.entity.position.distanceTo(nearestEntity.position) < LOOK_RADIUS) {
          const playerEyes = nearestEntity.position.offset(0, nearestEntity.height, 0)

          const isNotMoving = bot.entity.onGround && bot.entity.velocity.x === 0 && bot.entity.velocity.z === 0

          // Attempts to not interrupt pathfinding or other things
          if(isNotMoving) bot.lookAt(playerEyes)
      }
    }
  })

}

function length(v: Vec3): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
}