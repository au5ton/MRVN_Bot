
import minecraftData from 'minecraft-data'
import { Entity } from 'prismarine-entity'

import { MineflayerPlugin } from './index'

declare module "mineflayer" {
  interface Bot {
    canSeeEntity: (entity: Entity, vectorLength?: number) => boolean
  }
}

export const canSeeEntityPlugin: MineflayerPlugin = (bot) => {
  const mcData = minecraftData(bot.version)
  const transparent_blocks = mcData.blocksArray.filter(e => e.transparent || e.boundingBox === 'empty').map(e => e.id)

  bot.canSeeEntity = (entity: Entity, vectorLength: number = 5 / 16) => {
    const { height, position } = bot.entity
    const entityPos = entity.position.offset(-entity.width / 2, 0, -entity.width / 2)

    // bounding box verticies (8 verticies)
    const targetBoundingBoxVertices = [
      entityPos.offset(0,            0,             0),
      entityPos.offset(entity.width, 0,             0),
      entityPos.offset(0,            0,             entity.width),
      entityPos.offset(entity.width, 0,             entity.width),
      entityPos.offset(0,            entity.height, 0),
      entityPos.offset(entity.width, entity.height, 0),
      entityPos.offset(0,            entity.height, entity.width),
      entityPos.offset(entity.width, entity.height, entity.width),
    ]

    // Check the line of sight for every vertex
    const lineOfSight = targetBoundingBoxVertices.map(bbVertex => {
      // cursor starts at bot's eyes
      const cursor = position.offset(0, height, 0)
      // a vector from a to b = b - a
      const step = bbVertex.minus(cursor).unit().scaled(vectorLength)
      // we shouldn't step farther than the distance to the entity, plus the longest line inside the bounding box
      const maxSteps = bbVertex.distanceTo(position) / vectorLength

      // check for obstacles
      for (let i = 0; i < maxSteps; ++i) {
        cursor.add(step)
        const block = bot.blockAt(cursor)

        // block must be air/null or a transparent block
        if (block !== null && !transparent_blocks.includes(block.type)) {
          //console.log(`block problem for vertex ${bbVertex}! ${mcData.blocks[block.type].name} found at ${block.position}`)
          return false
        }
      }

      //console.log(`vertex ${bbVertex} met no obstacles along the way`)
      return true
    })

    // must have at least 1 vertex in LOS
    return lineOfSight.some(e => e)
  }
}