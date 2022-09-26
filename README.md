[Français](https://github.com/Zepines/grafibot/blob/main/README_fr.md)

# Grafibot
Grafibot is a Discord bot designed for the [Grafikart](https://grafikart.fr/tchat) Discord guild. He aims to propose a better solution than the [current one](https://github.com/Grafikart/grafibot), by adopting his features and adding new ones.

This bot is not designed to be used with another guild than this one.<br/>
However, you can easily adapt it to your guild and your needs.

# Getting started
## Requirements
`Node.js` version `16.17.0` or newer.<br/>
`npm` version `8.15.0` or newer.

## Setup
### Download the latest release
Download the latest Grafibot release on the [realeases page](https://github.com/Zepines/grafibot/releases).

### Install dependencies
```console
npm install
```

### Environment variables
This bot use a `.env` file for storing different configurations.

You need to create one with these variables:
```txt
# Your bot token
CREDENTIAL_BOT_TOKEN=

# Your application ID
CREDENTIAL_APPLICATION_ID=

# Guild administrator ID
# This user will be mentioned in the logs channel when necessary
USER_ID_GRAFIKART=

# Your guild ID
CREDENTIAL_GUILD_ID=

# Moderators role ID
# This role is used to restrict certain actions to the moderators
ROLE_ID_ACCUSTOMED=

# Channels ID for the logs
CHANNEL_ID_LOGS=

# Rules channel ID
CHANNEL_ID_RULES=

# Emojis for the "Big Brain" reaction response
# Must be an Unicode emojis, like "🧠"
EMOJI_NAME_BIG_BRAIN=

# Emojis for the "Report" reaction response
# Must be an Unicode emojis, like "👮"
EMOJI_NAME_REPORT=

# Emojis for the "Dry" reaction response
# Must be an Unicode emojis, like "🏜"
EMOJI_NAME_DRY=
```

### Build the project
Compile the TypeScript project to JavaScript.

#### Using `npm`
```console
npm run build
```

#### Using the `typescript` package directly
```
tsc
```

### Start the bot
You can now start the bot.

#### Using `npm`
```console
npm run start
```

#### Using `node` directly
```
node ./dist/
```

# Licensing
This project is licensed under the [MIT license](https://github.com/Zepines/grafibot/blob/main/LICENSE).