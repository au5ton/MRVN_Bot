import * as mineflayer from 'mineflayer'

export type CommandHandler = (bot: mineflayer.Bot, username: string, message: string) => Promise<void>

export class CommandProcessor {
  private commands: {[key: string]: CommandHandler};
  private runningCommand: Promise<any> | null;
  
  constructor() {
    this.commands = {};
    this.runningCommand = null;
  }

  registerCommand(options: {
    name: string,
    run: CommandHandler
  }) {
    this.commands[options.name.toLowerCase()] = options.run
  }

  async processCommand(bot: mineflayer.Bot, username: string, message: string) {
    for(let key in this.commands) {
      if(message.toLowerCase().startsWith(key)) {
        if(this.runningCommand !== null) {
          bot.whisper(username, `Sorry, I'm busy right now.`);
        }
        else {
          this.runningCommand = this.commands[key](bot, username, message);
          await this.runningCommand;
          this.runningCommand = null;
        }
      }
    }
  }
}
