import { MessageReaction, GuildMember, EmbedBuilder, Colors, Message } from "discord.js";
import Grafibot from "../utils/Grafibot";
import toFormatedTimestamp from "../utils/helpers/toFormatedTimestamp";
import BaseGrafibotReactionResponse from "../utils/structures/BaseGrafibotReactionResponse";

/**
 * Reaction response: Big Brain
 * Detects if a member with the right privilege use the right reaction then warns the message author and log that in the logs channel.
 */
export default class BigBrainReactionResponse extends BaseGrafibotReactionResponse {
    constructor() {
        super({ emoji: process.env.EMOJI_NAME_BIG_BRAIN, needsPriviledge: true });
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
            // Fetches partial data.
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
                .setTitle('Mr JeSaisTout')
                .setDescription('Inutile de donner plus d\'informations que nécessaire.\n\nEssaie d\'adapter ta réponse à la discussion. Donner trop d\'informations peut être déroutant et finalement nuire à la discussion.')
                .setImage('https://c.tenor.com/3eIvVsG3yPYAAAAM/the-universe-tim-and-eric-mind-blown.gif');

            await message.reply({ embeds: [warnMessage] });

            // Builds and sends the log message in the logs channel then reply to this message with the incriminated message.
            const warnMessageLog = new EmbedBuilder()
                .setColor(Colors.Green)
                .setTitle('Réponse à une réaction: Mr JeSaisTout')
                .setDescription('L\'auteur du message a été avertis.')
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

            console.info(`Reaction response 'Big Brain' has responded to a reaction on the message ${message.id} in channel ${message.channel.id}.`);
        }
    }
}
