# discord-purge-messages
A simple web interface to easily purge messages you sent with Discord. Supports DM channels, group DM channels and guilds channels.

It is a shame that this cannot be done natively in Discord.

**Note:** This is automating Discord tasks, and can be seen as a self-bot, which is unallowed by Discord TOS. You might get your account banned (never happened to me, yet, even though I deleted 10s of thousands of messages with it).

## Configuration
Copy [`.env.example`](./.env.example) to `.env` and fill its configuration (see [Finding your Discord token as a user](#Finding-your-Discord-token-as-a-user)).

Install dependencies
```sh
yarn
```

Start the server
```sh
yarn start
```

Now you can go to http://localhost:3000/ to purge your messages.

## Finding your Discord token as a user
1. Open the Discord client console with `Cltr + shift + i`
2. Open the "Network" tab and send a message in any channel
3. Click on the newly added entry in the network calls list
4. The `Authorization` response header value is your token!

## Demo
Youtube: https://youtu.be/MX-m28FHUTo

## License
[The MIT license](./LICENSE)
