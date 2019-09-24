import Discord from 'discord.js'

import { DISCORD_ACCOUNT_TOKEN } from './config'

export const bot = new Discord.Client()

export const startBot = async () => {
  console.log('Starting Discord bot ...')
  await bot.login(DISCORD_ACCOUNT_TOKEN)
  console.log('Discord bot was started.')
}
