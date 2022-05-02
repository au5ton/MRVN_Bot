import { Movements } from 'mineflayer-pathfinder'
//const { GoalNear, GoalFollow, GoalInvert, Goal } = goals
import minecraftData from 'minecraft-data'

import { CommandHandler } from './CommandProcessor'
import { GoalAvoidEntities } from '../util/goals';
import { Bot } from 'mineflayer';
import { Entity } from 'prismarine-entity'
import { Vec3 } from 'vec3';

export const safeDistance: CommandHandler = async (bot, username, message) => {
  const mcData = minecraftData(bot.version)
  const defaultMove = new Movements(bot, mcData as any)

  const target = bot.players[username]?.entity
  if (!target) {
    bot.whisper(username, 'I dont see you!')
    return
  }

  //console.log(entityInSight(bot))
  console.log(canSeeEntity(bot, target))

  // const HOSTILE_MOB_IDS = mcData.entitiesArray.filter(e => e.type === 'hostile').map(e => e.id);
  // mcData.entitiesArray.filter

  
  //const { x: playerX, y: playerY, z: playerZ } = target.position

  //bot.pathfinder.setMovements(defaultMove)
  //const RANGE_GOAL = 1; // get within this radius of the player
  //bot.pathfinder.setGoal(new GoalNear(playerX, playerY, playerZ, RANGE_GOAL))
  //bot.whisper(username, `I'm on my way, friend.`)

  //bot.pathfinder.setGoal(new GoalFollow(target, 5), true);
  //(bot.pathfinder as any).searchRadius = 10;
  //bot.pathfinder.setGoal(new GoalInvert(new GoalFollow(target, 5)), true);
  //bot.pathfinder.setGoal(new GoalRunAway(target, 5), true);
  //bot.pathfinder.setGoal(new GoalAvoidEntities(bot, entity => entity.type === 'player', 5), true);
  //bot.pathfinder.setGoal(new GoalAvoidEntities(bot, entity => entity.name === 'cow', 5), true);
  //bot.pathfinder.setGoal(new GoalAvoidEntities(bot, entity => entity.entityType !== undefined && HOSTILE_MOB_IDS.includes(entity.entityType), 5), true);

  //await bot.pathfinder.goto(new GoalNear(playerX, playerY, playerZ, RANGE_GOAL))
  //bot.whisper(username, `I've arrived!`)
}

function canSeeEntity(bot: Bot, entity: Entity, vectorLength: number = 5 / 16): boolean {
  const mcData = minecraftData(bot.version)
  const { height, position } = bot.entity

  console.log('======')
  console.log(`entity size: ${entity.width} x ${entity.height} @ ${entity.position}`)

  const entityPos = entity.position.offset(-entity.width / 2, 0, -entity.width / 2)
  const entityCenter = entity.position.offset(0, entity.height / 2, 0)
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
  // move the vertices 0.01 towards the center of the entity
  //.map(vertex => vertex.plus(entityCenter.minus(vertex).scaled(0.1)))

  // Check the line of sight for every vertex
  const lineOfSight = targetBoundingBoxVertices.map(bbVertex => {
    // cursor starts at bot's eyes
    const cursor = position.offset(0, height, 0)
    // a vector from a to b = b - a
    const step = bbVertex.minus(cursor).unit().scaled(vectorLength)
    console.log(`step = ${step}, magnitude of step = ${step.norm()}`)
    //const step = entity.position.offset(0, entity.height / 2, 0).minus(cursor).scaled(vectorLength)

    // we shouldn't step farther than the distance to the entity, plus the longest line inside the bounding box
    const maxSteps = bbVertex.distanceTo(position) / vectorLength
    console.log(`vertex distance to target = ${bbVertex.distanceTo(position)}`)
    console.log(`maxSteps = ${maxSteps}`)
    //const maxSteps = entity.position.distanceTo(entity.position) + entity.width * entity.height

    //bot.blo

    // check for obstacles
    for (let i = 0; i < maxSteps; ++i) {
      cursor.add(step)
      // block must be air/null or a transparent block
      const transparent_blocks = mcData.blocksArray.filter(e => e.transparent).map(e => e.id)
      const block = bot.blockAt(cursor)

      //bot.bot
      // if a block was found and it isnt a transparent one
      if (block === null) {
        //console.log(`AIR @ ${cursor}`)
      }
      else {
        //console.log(`${mcData.blocks[block.type].name} found at ${block.position}`)
      }
      if (block !== null && !transparent_blocks.includes(block.type)) {
        console.log(`block problem for vertex ${bbVertex}! ${mcData.blocks[block.type].name} found at ${block.position}`)
        console.log('-----')
        return false
      }
      //console.log(`vertex ${bbVertex} | cursor = ${cursor} entityPos = ${entity.position}`)
      //bot.blockAt(cursor)

      // if(isPointInEntity(cursor, entity)) {
      //   return true
      // }
    }

    console.log(`vertex ${bbVertex} met no obstacles along the way`)
    console.log('-----')
    return true
  })

  return lineOfSight.some(e => e)

  // for (const bbVertex of targetBoundingBoxVertices) {
  //   // cursor starts at bot's eyes
  //   const cursor = position.offset(0, height, 0)
  //   // a vector from a to b = b - a
  //   const step = bbVertex.minus(cursor).scaled(vectorLength)
  //   //const step = entity.position.offset(0, entity.height / 2, 0).minus(cursor).scaled(vectorLength)

  //   // we shouldn't step farther than the distance to the entity, plus the longest line inside the bounding box
  //   const maxSteps = bbVertex.distanceTo(entity.position) + entity.width * entity.height
  //   //const maxSteps = entity.position.distanceTo(entity.position) + entity.width * entity.height

  //   //bot.blo

  //   for (let i = 0; i < maxSteps; ++i) {
  //     cursor.add(step)
  //     // block must be air/null or a transparent block
  //     const transparent_blocks = mcData.blocksArray.filter(e => e.transparent).map(e => e.id)
  //     const block = bot.blockAt(cursor)
  //     if (block !== null && !transparent_blocks.includes(block.type)) {
  //       console.log(`block problem! ${mcData.blocks[block.type].name} found at ${block.position}`)
  //       return false
  //     }
  //     //console.log(`vertex ${bbVertex} | cursor = ${cursor} entityPos = ${entity.position}`)
  //     //bot.blockAt(cursor)

  //     // if(isPointInEntity(cursor, entity)) {
  //     //   return true
  //     // }
  //   }
  // }

  // return false
}

function entityInSight(bot: Bot, maxSteps = 256, vectorLength = 5 / 16) {
  const { height, position, yaw, pitch } = bot.entity
  const cursor = position.offset(0, height, 0)
  const x = -Math.sin(yaw) * Math.cos(pitch)
  const y = Math.sin(pitch)
  const z = -Math.cos(yaw) * Math.cos(pitch)

  const step = new Vec3(x, y, z).scaled(vectorLength)

  for (let i = 0; i < maxSteps; ++i) {
    cursor.add(step)

    // Checking for entity
    for (const entity of Object.values(bot.entities)) {
      if (entity === bot.entity) {
        continue
      }
      if(isPointInEntity(cursor, entity)) {
        return entity
      }
    }
  }
}

function isPointInEntity (cursor: Vec3, entity: Entity) {
  const entityPos = entity.position.offset(-entity.width / 2, 0, -entity.width / 2)
  return cursor.x >= entityPos.x && cursor.x < entityPos.x + entity.width &&
         cursor.y >= entityPos.y && cursor.y < entityPos.y + entity.height &&
         cursor.z >= entityPos.z && cursor.z < entityPos.z + entity.width
}

