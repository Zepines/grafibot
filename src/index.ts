import 'dotenv/config';
import { Events, GatewayIntentBits, Partials } from 'discord.js';
import Grafibot from './utils/Grafibot';

const client = new Grafibot({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent
    ],
    partials: [
        Partials.Message,
        Partials.Reaction
    ]
});

client.on(Events.ClientReady, async () => {
    await client.registerAllComponents();
    await client.deployCommands();

    console.info(`Client connected and ready to work.`);
});

client.on(Events.Error, err => {
    console.error(err);
});

client.login(process.env.CREDENTIAL_BOT_TOKEN);
