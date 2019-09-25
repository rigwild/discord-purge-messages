import express from 'express'
import { TextChannel, DMChannel, GroupDMChannel } from 'discord.js'

import { SERVER_PORT } from './config'
import { bot } from './bot'
import { asyncMiddleware, extractProfile } from './utils'

const api = express.Router()

// Get guilds data
api.get('/guilds', asyncMiddleware((req, res) => {
  const guilds = bot.guilds
    .map(x => ({ id: x.id, name: x.name, icon: x.iconURL }))
    .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
  res.json({ data: guilds })
}))

// Get a guild text channels
api.get('/guild/:guildId', asyncMiddleware((req, res) => {
  const { guildId } = req.params
  const guildChannels = bot.guilds.get(guildId).channels
    .filter(x => x instanceof TextChannel)
    .map(x => ({ id: x.id, name: x.name, category: x.parent ? x.parent.name : undefined }))
    .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
  res.json({ data: guildChannels })
}))

// Get private messages data
api.get('/dmChannels', asyncMiddleware((req, res) => {
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
}))

api.post('/purge', asyncMiddleware(async (req, res) => {
  const { channelId, amount: amountRaw = 9999999, deleteDelay: deleteDelayRaw = 200 } = req.body
  const amount = parseInt(amountRaw, 10)
  if (isNaN(amount)) throw new Error('The amount of messages to delete is not a valid integer.')
  const deleteDelay = parseInt(deleteDelayRaw, 10)
  if (isNaN(deleteDelay)) throw new Error('The delete delay is not a valid integer.')

  const channel = bot.channels.get(channelId)
  if (!(channel instanceof TextChannel) && !(channel instanceof DMChannel) && !(channel instanceof GroupDMChannel))
    throw new Error('The selected channel is not a text-based channel.')

  const userId = bot.user.id
  let lastInspectedMessageSnowflake = '999999999999999999'

  let deletionCount = 0
  let continuePurge = true
  while (continuePurge) {
    const messages = await channel.fetchMessages({ limit: 100, before: lastInspectedMessageSnowflake })

    if (messages.size < 100 && messages.filter(x => x.author.id === userId).size === 0) {
      continuePurge = false
      continue
    }

    // Update last message snowflake for next iteration
    lastInspectedMessageSnowflake = messages.first().id

    for (const aMessage of messages.values()) {
      // Check if the max amount was reached
      if (amount <= deletionCount) {
        continuePurge = false
        continue
      }

      // Update last message snowflake for next iteration
      lastInspectedMessageSnowflake = aMessage.id

      // Check the message was sent by the user
      if (aMessage.author.id !== userId || !aMessage.deletable) continue
      await aMessage.delete()
      deletionCount++

      // Wait 200ms before deleting next message (dodge self-bot ban)
      await new Promise(resolve => setTimeout(resolve, deleteDelay))
    }
  }
  res.json({ data: deletionCount })
}))

// Load the server configuration
const app = express()
// Parse JSON input
app.use(express.json())
// Load api routes in the server
app.use('/api', api)
// Load static front-end
app.use('/', express.static('public'))
// Middleware to handle middleware errors
app.use((err, req, res, next) => {
  console.error(err)
  res.status(400).json({ message: err.message })
  next()
})

export const startServer = async () => {
  console.log('Starting server...')
  return new Promise(resolve =>
    app.listen(SERVER_PORT, () => {
      console.log(`Server is listening on http://localhost:${SERVER_PORT}`)
      resolve()
    })
  )
}
