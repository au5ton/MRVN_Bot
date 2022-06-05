import 'dotenv/config'
import * as mineflayer from 'mineflayer'
import { pathfinder } from 'mineflayer-pathfinder'
import autoEat from 'mineflayer-auto-eat'
import armorManager from 'mineflayer-armor-manager'
import { plugin as pvp } from 'mineflayer-pvp'
const bloodhound = require('mineflayer-bloodhound')
import { BehaviorFollowEntity, BehaviorGetClosestEntity, BehaviorIdle, BehaviorLookAtEntity, BotStateMachine, EntityFilters, NestedStateMachine, StateMachineTargets, StateMachineWebserver, StateTransition } from 'mineflayer-statemachine'

import { CommandProcessor } from './commands/CommandProcessor'
import { comeHere, depositChest, goTo, whereAreYou, withdrawChest } from './commands'
import { canSeeEntityPlugin, curiousEyes, selfDefense } from './plugins'
import { safeDistance } from './commands/safeDistance'
import { createGoToPlayerState } from './statemachines/BehaviorGoToPlayer'

console.log('Bot starting')

const bot = mineflayer.createBot({
  host: 'localhost',
  port: 25565,
  username: process.env.MICROSOFT_LOGIN!,
  password: process.env.MICROSOFT_PASSWORD,
  auth: 'microsoft'
})

// 3rd party plugins
bot.loadPlugin(pathfinder)
bot.loadPlugin(autoEat)
bot.loadPlugin(armorManager)
bot.loadPlugin(pvp)
bot.loadPlugin(bloodhound)
// custom plugins
bot.loadPlugin(canSeeEntityPlugin)
//bot.loadPlugin(curiousEyes)
//bot.loadPlugin(selfDefense)

// bot.on('chat', (username, message) => {
//   if (username === bot.username) return
//   bot.chat(message)
// })

bot.once('spawn', () => {

  // shared data
  const targets: StateMachineTargets = {};

  // create our states
  const idle = new BehaviorIdle();
  const followPlayerState = createGoToPlayerState(bot);

  // create out transitions
  const transitions = [

    new StateTransition({
      name: 'followPlayerState',
      parent: idle,
      child: followPlayerState,
      shouldTransition: () => false
    }),

    new StateTransition({
      parent: followPlayerState,
      child: idle,
      shouldTransition: () => followPlayerState.isFinished()
    })

  ];

  // Now we just wrap our transition list in a nested state machine layer. We want the bot
  // to start on the getClosestPlayer state, so we'll specify that here.
  const rootLayer = new NestedStateMachine(transitions, idle);
  
  // We can start our state machine simply by creating a new instance.
  const machine = new BotStateMachine(bot as any, rootLayer);
  const webserver = new StateMachineWebserver(bot as any, machine);
  webserver.startServer();



  const commandProcessor = new CommandProcessor();
  commandProcessor.registerCommand({
    name: 'do thing',
    run: async (bot, username, message) => {
      bot.whisper(username, `I'm going to try to do the thing`)
      transitions.find(e => e.name === 'followPlayerState')?.trigger()
    }
  })

   // commandProcessor.registerCommand({
  //   name: 'come here',
  //   run: comeHere
  // })
  // commandProcessor.registerCommand({
  //   name: 'go to',
  //   run: goTo
  // })
  // commandProcessor.registerCommand({
  //   name: 'where are you',
  //   run: whereAreYou
  // })
  // commandProcessor.registerCommand({
  //   name: 'deposit chest',
  //   run: depositChest
  // })
  // commandProcessor.registerCommand({
  //   name: 'withdraw chest',
  //   run: withdrawChest
  // })

  bot.on('whisper', (username, message) => {
    if (username === bot.username) return
    commandProcessor.processCommand(bot, username, message);
  })
})

bot.on('kicked', console.log);
bot.on('error', console.log);