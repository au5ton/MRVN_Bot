import { MineflayerPlugin } from './index'
import minecraftData from 'minecraft-data'
import { Vec3 } from 'vec3'
import { isBlock } from 'typescript'
import { snooze } from '@au5ton/snooze'

export const curiousEyes: MineflayerPlugin = (bot) => {
  const mcData = minecraftData(bot.version)

  let wasPlayerLookingAt = false;

  bot.on('entityMoved', entity => {
    //bot.entity.position.distanceTo
    const nearestEntity = bot.nearestEntity()
    // if nearest entity is a player, and the player is within 10 blocks away
    if(nearestEntity && (nearestEntity.type === 'player' || nearestEntity.type === 'object') && bot.entity.position.distanceTo(nearestEntity.position) < 10) {
        const playerEyes = nearestEntity.position.offset(0, nearestEntity.height, 0)

        const isNotMoving = bot.entity.onGround && bot.entity.velocity.x === 0 && bot.entity.velocity.z === 0

        if(isNotMoving) bot.lookAt(playerEyes)

        // the directional vector can be determined by subtracting the start from the terminal point
        const dir = bot.entity.position.offset(0, bot.entity.height, 0).minus(playerEyes).normalize()
        // calculate the pitch and yaw necessary of the player to be looking at the bot
        const mPitch = Math.asin(-dir.y)
        const mYaw = Math.atan(dir.x/dir.z)

        const fifteenDegreesInRad = Math.PI / 12

        const isPlayerLookingAt = (mPitch - fifteenDegreesInRad) <= nearestEntity.pitch && nearestEntity.pitch <= (mPitch + fifteenDegreesInRad)
          && (mYaw - fifteenDegreesInRad) <= nearestEntity.yaw && nearestEntity.yaw <= (mYaw + fifteenDegreesInRad);
        
        if (wasPlayerLookingAt !== isPlayerLookingAt) {
          console.log('change look')
        }

        if(isNotMoving && isPlayerLookingAt && wasPlayerLookingAt === false && bot.getControlState('sneak') === false) {
          console.log('SNEAK')
          bot.setControlState('sneak', true);
          setTimeout(() => {
            bot.setControlState('sneak', false);
          }, 500)
        }

        wasPlayerLookingAt = isPlayerLookingAt;

        //console.log(`Nearest Player | Pitch=${nearestEntity.pitch} Yaw=${nearestEntity.yaw}, MaybePitch=${mPitch} MaybeYaw=${mYaw}`)
        //console.log(`Nearest player looking = ${isPlayerLookingAt}`)
    }
  })

}

function length(v: Vec3): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
}