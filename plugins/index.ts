import * as mineflayer from 'mineflayer'
export type MineflayerPlugin = (bot: mineflayer.Bot) => void;

export { curiousEyes } from './curiousEyes'
export { selfDefense } from './selfDefense'
export { canSeeEntityPlugin } from './canSeeEntity'
