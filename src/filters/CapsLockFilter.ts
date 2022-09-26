import { Colors, EmbedBuilder, Message } from "discord.js";
import Grafibot from "../utils/Grafibot";
import toFormatedTimestamp from "../utils/helpers/toFormatedTimestamp";
import BaseGrafibotFilter from "../utils/structures/BaseGrafibotFilter";
import { FilterScopeEnum } from "../utils/types/GrafibotFilterTypes";

/**
 * Filter: Caps lock.
 * Detects uppercased messages then warns the author and log the incriminated message in the logs channel.
 */
export default class CapsLockFilter extends BaseGrafibotFilter {
    constructor() {
        super(FilterScopeEnum.Message);
    }

    /**
     * Applies the filter to the message.
     * @param client - The Grafibot client.
     * @param message - The message received.
     */
    async run(client: Grafibot, message: Message): Promise<void> {
        const messageContent = message.content;

        if (messageContent === messageContent.toUpperCase() && messageContent.length > 10) {
            // Builds and sends as a message reply the warn message.
            const warnMessage = new EmbedBuilder()
                .setColor(Colors.Orange)
                .setTitle('Mes oreilles !')
                .setDescription('Pas la peine de hurler !')
                .setImage('https://c.tenor.com/czDcRYZWDo0AAAAC/raccoon-aaaaaa.gif');

            await message.reply({ embeds: [warnMessage] });

            // Builds and sends the log message in the logs channel then reply to this message with the incriminated message.
            const warnMessageLog = new EmbedBuilder()
                .setColor(Colors.Green)
                .setTitle('Filtre: Majuscules')
                .setDescription('Le message en réponse à celui-ci ne contient que des majuscules.')
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

            console.info(`The message ${message.id} has been filtered by the filter 'Caps lock' in channel ${message.channel.id}.`);
        }
    }
}
