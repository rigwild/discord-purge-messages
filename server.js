import express from 'express'
import { TextChannel, DMChannel, GroupDMChannel } from 'discord.js'

import { SERVER_PORT } from './config'
import { bot } from './bot'

const app = express()

/**
 * Extract profile data from a Discord user
 * @param {import('discord.js').User} discordUser Targetted user
 * @eturns User profile
 */
const extractProfile = discordUser => ({
  id: discordUser.id,
  username: discordUser.username,
  discriminator: discordUser.discriminator,
  avatar: discordUser.avatarURL ? discordUser.avatarURL.replace('size=2048', 'size=32') : null
})

const routes = express.Router()

// Get guilds data
routes.get('/guilds', (req, res) => {
  const guilds = bot.guilds
    .map(x => ({ id: x.id, name: x.name, icon: x.iconURL }))
    .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
  res.json({ data: guilds })
})

// Get a guild text channels
routes.get('/guild/:guildId', (req, res) => {
  const { guildId } = req.params
  const guildChannels = bot.guilds.get(guildId).channels
    .filter(x => x instanceof TextChannel)
    .map(x => ({ id: x.id, name: x.name, category: x.parent ? x.parent.name : undefined }))
    .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
  res.json({ data: guildChannels })
})

// Get private messages data
routes.get('/dmChannels', (req, res) => {
  const dmChannels = bot.channels
    .filter(x => x instanceof DMChannel || x instanceof GroupDMChannel)
    .map(x => {
      if (x instanceof DMChannel)
        return {
          id: x.id,
          type: 'dm',
          user: extractProfile(x.recipient)
        }
      else if (x instanceof GroupDMChannel)
        return {
          id: x.id,
          type: 'dmGroup',
          users: x.recipients
            .map(user => extractProfile(user))
            .sort((a, b) => a.username.toLowerCase().localeCompare(b.username.toLowerCase()))
        }
    })
  res.json({ data: dmChannels })
})

app.use('/api', routes)
app.use('/', express.static('public'))

export const startServer = async () => {
  console.log('Starting server...')
  return new Promise(resolve =>
    app.listen(SERVER_PORT, () => {
      console.log(`Server is listening on http://localhost:${SERVER_PORT}`)
      resolve()
    })
  )
}
