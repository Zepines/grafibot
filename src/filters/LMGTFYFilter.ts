import { Colors, EmbedBuilder, Message } from "discord.js";
import Grafibot from "../utils/Grafibot";
import toFormatedTimestamp from "../utils/helpers/toFormatedTimestamp";
import BaseGrafibotFilter from "../utils/structures/BaseGrafibotFilter";
import { FilterScopeEnum } from "../utils/types/GrafibotFilterTypes";

/**
 * Filter: LMGTFY
 * Detects messages that contains a LMGTFY kind link then warns the author and log the incriminated message in the logs channel.
 */
export default class LMGTFYFilter extends BaseGrafibotFilter {
    constructor() {
        super(FilterScopeEnum.Message);
    }

    /**
     * Applies the filter to the message.
     * @param client - The Grafibot client.
     * @param message - The received message.
     */
    async run(client: Grafibot, message: Message): Promise<void> {
        const regex = /(lmgtfy\.(app|com)|letmegooglethat\.com|googlethatforyou\.com)/i;
        const messageContent = message.content;

        const appliesFilter = messageContent.match(regex);

        if (appliesFilter) {
            // Builds and sends as a message reply the warn message.
            const warnMessage = new EmbedBuilder()
                .setColor(Colors.Orange)
                .setTitle('Expliquer c\'est mieux')
                .setDescription('Plutôt que de rediriger vers des liens de type *Let me Google that for you*, explique comment bien faire une recherche et identifier les résultats pertinents.')
                .setImage('https://c.tenor.com/029YT3vrdzoAAAAM/cute-raccoon.gif');

            await message.reply({ embeds: [warnMessage] });

            // Builds and sends the log message in the logs channel then reply to this message with the incriminated message.
            const warnMessageLog = new EmbedBuilder()
                .setColor(Colors.Green)
                .setTitle('Filtre: LMGTFY')
                .setDescription(`Le message en réponse à celui-ci contient le lien de type *Let me Google that for you* suivant \`${appliesFilter[0]}\`.`)
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

            console.info(`The message ${message.id} has been filtered by the filter 'LMGTFY' in channel ${message.channel.id}.`);
        }
    }
}
