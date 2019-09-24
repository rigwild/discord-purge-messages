import dotenvSafe from 'dotenv-safe'
dotenvSafe.config()

export const { DISCORD_ACCOUNT_TOKEN, SERVER_PORT } = process.env
