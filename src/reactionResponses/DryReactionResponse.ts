import { MessageReaction, GuildMember, Message, EmbedBuilder, Colors } from "discord.js";
import Grafibot from "../utils/Grafibot";
import toFormatedTimestamp from "../utils/helpers/toFormatedTimestamp";
import BaseGrafibotReactionResponse from "../utils/structures/BaseGrafibotReactionResponse";

/**
 * Reaction response: Dry
 * Detects if a member with the right privilege use the right reaction then warns the message author and log that in the logs channel.
 */
export default class DryReactionResponse extends BaseGrafibotReactionResponse {
    constructor() {
        super({ emoji: process.env.EMOJI_NAME_DRY, needsPriviledge: true});
    }

    /**
     * Executes the reaction response.
     * @param client - The Grafibot client.
     * @param reaction - The reaction received.
     * @param member - The member who has reacted.
     */
    async run(client: Grafibot, reaction: MessageReaction, member: GuildMember): Promise<void> {
        const reactionEmoji = reaction.emoji.name;

        if (reactionEmoji === this.emoji) {
            // Fetches partial data
            let message: Message;

            if (reaction.message.partial) {
                message = await reaction.message.fetch();
            } else {
                message = reaction.message;
            }

            // Removes the reaction.
            await reaction.remove();

            // Builds and sends as a message reply the warn message.
            const warnMessage = new EmbedBuilder()
                .setColor(Colors.Orange)
                .setTitle('Plutôt sec comme réponse')
                .setDescription('Pas besoin d\'être aussi sec !\nSi la question ne t\'intéresse pas, abstiens-toi d\'y répondre.')
                .setImage('https://c.tenor.com/elLj8pTWa6QAAAAC/raccoon-water.gif');

            await message.reply({ embeds: [warnMessage] });

            // Builds and sends the log message in the logs channel then reply to this message with the incriminated message.
            const warnMessageLog = new EmbedBuilder()
                .setColor(Colors.Green)
                .setTitle('Réponse à une réaction: Sec')
                .setDescription(`L\'auteur du message a été avertis.`)
                .setFields(
                    { name: 'Auteur', value: `<@${member.id}>` },
                    { name: 'Salon', value: `<#${message.channel.id}>` }
                )
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

            await loggedMessage.reply({ content: message.content, embeds: [logMessageReply] });

            console.info(`Reaction response 'Dry' has responded to a reaction on the message ${message.id} in channel ${message.channel.id}.`);
        }
    }
}
