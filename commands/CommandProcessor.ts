import * as mineflayer from 'mineflayer'

export type CommandHandler = (bot: mineflayer.Bot, username: string, message: string) => Promise<void>

export class CommandProcessor {
  private commands: {[key: string]: CommandHandler};
  private commandRunning: boolean;
  
  constructor() {
    this.commands = {};
    this.commandRunning = false;
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
        if(this.commandRunning) {
          bot.whisper(username, `Sorry, I'm busy right now.`);
        }
        else {
          this.commandRunning = true;
          await this.commands[key](bot, username, message);
          this.commandRunning = false;
        }
      }
    }
  }
}
