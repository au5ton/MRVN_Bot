import { Bot } from 'mineflayer'
import { goals, Move } from 'mineflayer-pathfinder'
const { Goal } = goals
import minecraftData from 'minecraft-data'
import { Entity } from 'prismarine-entity';
import { Vec3 } from 'vec3';

export class GoalRunAway extends Goal {
  public x: number;
  public y: number;
  public z: number;
  public entity: Entity;
  public rangeSq: number;
  public range: number;
  public rangeWiggle: number = 4

  constructor(entity: Entity, range: number) {
    super()
    this.entity = entity
    this.x = Math.floor(entity.position.x)
    this.y = Math.floor(entity.position.y)
    this.z = Math.floor(entity.position.z)
    this.rangeSq = range * range
    this.range = range
  }

  public heuristic(node: Move): number {
    const dx = this.x - node.x
    const dy = this.y - node.y
    const dz = this.z - node.z
    const ddx = this.range - dx
    //const ddy = this.ra
    const ddz = this.range - dz
    return distanceXZ(ddx, ddz) + Math.abs(dy)
  }
  public isEnd(node: Move): boolean {
    const dx = this.x - node.x
    const dy = this.y - node.y
    const dz = this.z - node.z
    const end = (dx * dx + dy * dy + dz * dz) <= (this.rangeSq + this.rangeWiggle)
    && (dx * dx + dy * dy + dz * dz) >= (this.rangeSq - this.rangeWiggle)
    console.log('isEnd?',end)
    return end
  }
  public hasChanged(): boolean {
    const p = this.entity.position.floored()
    const dx = this.x - p.x
    const dy = this.y - p.y
    const dz = this.z - p.z
    if ((dx * dx + dy * dy + dz * dz) > 1) {
      console.log('has changed')
      this.x = p.x
      this.y = p.y
      this.z = p.z
      return true
    }
    console.log('hasnt changed')
    return false
  }
  
}

export class GoalAvoidEntities extends Goal {
  public x?: number;
  public y?: number;
  public z?: number;
  public bot: Bot
  public avoidBy: (entity: Entity) => boolean
  public entity?: Entity;
  public rangeSq: number;
  public range: number;
  public rangeWiggle: number = 2

  //Object.keys(bot.entities).map(id => bot.entities[id])

  constructor(bot: Bot, avoidBy: (entity: Entity) => boolean, range: number) {
    super()
    this.bot = bot
    this.avoidBy = entity => entity.id !== bot.entity.id && avoidBy(entity)
    const nearest = this.bot.nearestEntity(avoidBy)
    this.entity = nearest !== null ? nearest : undefined
    this.x = this.entity ? Math.floor(this.entity.position.x) : undefined 
    this.y = this.entity ? Math.floor(this.entity.position.y) : undefined 
    this.z = this.entity ? Math.floor(this.entity.position.z) : undefined 
    this.rangeSq = range * range
    this.range = range
  }

  private refreshEntity() {
    const nearest = this.bot.nearestEntity(this.avoidBy) ?? undefined
    // new nearest entity means yes there's a change
    if(typeof(this.entity) !== typeof(nearest) || (this.entity && nearest && this.entity.id !== nearest.id)) {
      this.x = nearest?.position.x
      this.y = nearest?.position.y
      this.z = nearest?.position.z
      this.entity = nearest
      // if(this.entity) {
      //   console.log('looking1')
      //   this.bot.lookAt(new Vec3(this.entity.position.x, this.entity.position.y + this.entity.height/2, this.entity.position.z))
      // }
    }
    console.log(`after refresh: ${this.entity}`)
  }

  public heuristic(node: Move): number {
    if(this.x && this.y && this.z) {
      const dx = this.x - node.x
      const dy = this.y - node.y
      const dz = this.z - node.z
      const ddx = this.range - dx
      //const ddy = this.ra
      const ddz = this.range - dz
      return distanceXZ(ddx, ddz) + Math.abs(dy)
    }
    return Number.POSITIVE_INFINITY
  }
  public isEnd(node: Move): boolean {
    if(this.x && this.y && this.z) {
      const dx = this.x - node.x
      const dy = this.y - node.y
      const dz = this.z - node.z
      const end = (dx * dx + dy * dy + dz * dz) <= (this.rangeSq + this.rangeWiggle)
      && (dx * dx + dy * dy + dz * dz) >= (this.rangeSq - this.rangeWiggle)
      console.log('isEnd?',end)
      if(end) {
        // const nearest = this.bot.nearestEntity(this.avoidBy) ?? undefined
        // if(nearest === undefined) {
        //   console.log('no more enemies?')
        // }
        if(this.entity) {
          console.log('looking1')
          //this.bot.lookAt(new Vec3(this.entity.position.x, this.entity.position.y + this.entity.height/2, this.entity.position.z))
          //this.bot.attack(this.entity)
          this.bot.pvp.attack(this.entity).then(() => this.bot.deactivateItem())
        }
      }

      return end
    }
    else {
      // no entities to target, we've reached the end
      return true
    }
  }
  public hasChanged(): boolean {
    const nearest = this.bot.nearestEntity(this.avoidBy) ?? undefined
    // new nearest entity means yes there's a change
    if(typeof(this.entity) !== typeof(nearest) || (this.entity && nearest && this.entity.id !== nearest.id)) {
      this.x = nearest?.position.x
      this.y = nearest?.position.y
      this.z = nearest?.position.z
      this.entity = nearest
      // if(this.entity) {
      //   console.log('looking1')
      //   this.bot.lookAt(new Vec3(this.entity.position.x, this.entity.position.y + this.entity.height/2, this.entity.position.z))
      // }
      if(this.entity === undefined) {
        this.bot.deactivateItem()
      }
      console.log('has changed (new)')
      return true
    }

    // if entities position has changed
    if(this.entity && this.x && this.y && this.z) {
      const p = this.entity.position.floored()
      const dx = this.x - p.x
      const dy = this.y - p.y
      const dz = this.z - p.z
      if ((dx * dx + dy * dy + dz * dz) > 1) {
        console.log('has changed (moved)')
        this.x = p.x
        this.y = p.y
        this.z = p.z
        // if(this.entity) {
        //   console.log('looking2')
        //   this.bot.lookAt(new Vec3(p.x, p.y + this.entity.height/2, p.z))
        // }
        return true
      }
    }
    console.log('hasnt changed')
    return false
  }
  
}

export function distanceXZ (dx: number, dz: number) {
  dx = Math.abs(dx)
  dz = Math.abs(dz)
  return Math.abs(dx - dz) + Math.min(dx, dz) * Math.SQRT2
}