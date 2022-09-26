import { Colors, EmbedBuilder, Message } from "discord.js";
import Grafibot from "../utils/Grafibot";
import toFormatedTimestamp from "../utils/helpers/toFormatedTimestamp";
import BaseGrafibotFilter from "../utils/structures/BaseGrafibotFilter";
import { FilterScopeEnum } from "../utils/types/GrafibotFilterTypes";

/**
 * Filter: Long code.
 * Detects messages that contains long code then warns the author and log the incriminated message in the logs channel.
 */
export default class LongCodeFilter extends BaseGrafibotFilter {
    constructor() {
        super(FilterScopeEnum.Message);
    }

    /**
     * Applies the filter to the message.
     * @param client - The Grafibot client.
     * @param message - The message received.
     */
    async run(client: Grafibot, message: Message): Promise<void> {
        const regexCode      = /([\{\}\[\]$;])/gm;
        const regexLineBreak = /\n/gm;
        const messageContent = message.content;

        const appliesCodeRegex      = messageContent.match(regexCode)?.length ?? 0;
        const appliesLineBreakRegex = messageContent.match(regexLineBreak)?.length ?? 0;

        if (appliesCodeRegex > 3 && appliesLineBreakRegex > 20) {
            // Builds and sends as a message reply the warn message.
            const warnMessage = new EmbedBuilder()
                .setColor(Colors.Orange)
                .setTitle('Code trop long')
                .setDescription('Ton message contient trop de code ! Merci de supprimer ton message et d\'utiliser [Mozilla Community Pastebin](https://paste.mozilla.org/) pour partager ton code.\n\nSi possible et si nécessaire, utilise un service comme [StackBlitz](https://stackblitz.com/) pour faciliter l\'aide.')
                .setImage('https://c.tenor.com/oCceKAnve60AAAAC/animal-funny.gif');

            await message.reply({ embeds: [warnMessage] });

            // Builds and sends the log message in the logs channel then reply to this message with the incriminated message.
            const warnMessageLog = new EmbedBuilder()
                .setColor(Colors.Green)
                .setTitle('Filtre: Trop de code')
                .setDescription('Le message en réponse à celui-ci contient trop de code.')
                .setTimestamp();

            const loggedMessage = await client.logger.log({ embeds: [warnMessageLog] });

            const logMessageReply = new EmbedBuilder()
                .setColor(Colors.Blurple)
                .setTitle(`Message ${message.id}`)
                .setURL(`https://discordapp.com/channels/${message.guildId}/${message.channel.id}/${message.id}`)
                .setFields(
                    { name: 'Auteur', value: `<@${message.author.id}>` },
                    { name: 'Salon', value: `<#${message.channel.id}>` },
                    { name: 'Horodatage', value: toFormatedTimestamp(message.createdTimestamp) }
                );

            await loggedMessage.reply({ content: messageContent, embeds: [logMessageReply] });

            console.info(`The message ${message.id} has been filtered by the filter 'Long code' in channel ${message.channel.id}.`);
        }
    }
}
