/**
 * Extract profile data from a Discord user
 * @param {import('discord.js').User} discordUser Targetted user
 * @eturns User profile
 */
export const extractProfile = discordUser => ({
  id: discordUser.id,
  username: discordUser.username,
  discriminator: discordUser.discriminator,
  avatar: discordUser.avatarURL ? discordUser.avatarURL.replace('size=2048', 'size=32') : null
})

/**
 * Call the error handler if a middleware function throw an error
 *
 * @param {Function} fn original middleware function of the route
 * @returns {Promise<Function>} the same middleware function of the route but error handled
 */
export const asyncMiddleware = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(err => next(err))
