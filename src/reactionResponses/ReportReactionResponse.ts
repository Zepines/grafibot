import { MessageReaction, GuildMember, EmbedBuilder, Colors, Message } from "discord.js";
import Grafibot from "../utils/Grafibot";
import toFormatedTimestamp from "../utils/helpers/toFormatedTimestamp";
import BaseGrafibotReactionResponse from "../utils/structures/BaseGrafibotReactionResponse";

/**
 * Reaction response: Report
 * Detects if a member with the right privilege use the right reaction then warns the message author and log that in the logs channel.
 */
export default class ReportReactionResponse extends BaseGrafibotReactionResponse {
    constructor() {
        super({ emoji: process.env.EMOJI_NAME_REPORT, needsPriviledge: false });
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
                .setColor(Colors.Red)
                .setTitle('Message signalé')
                .setDescription(`Ce message a été signalé à la modération part <@${member.id}>.\n\nMerci de ne **pas abuser** de ce système de signalement.`)
                .setImage('https://c.tenor.com/k1h2AfK-R1MAAAAM/aah.gif');

            await message.reply({ embeds: [warnMessage] });

            // Builds and sends the log and alert message in the logs channel then reply to this message with the incriminated message.
            const warnMessageLog = new EmbedBuilder()
                .setColor(Colors.Red)
                .setTitle('Réponse à une réaction: Signalement')
                .setDescription(`Un message a été signalé comme potentiellement indésirable.\n[Accéder au message](https://discordapp.com/channels/${message.guildId}/${message.channel.id}/${message.id})`)
                .setFields(
                    { name: 'Auteur', value: `<@${member.id}>` },
                    { name: 'Salon', value: `<#${message.channel.id}>` }
                )
                .setTimestamp();

            const loggedMessage = await client.logger.log({ content: `<@${process.env.USER_ID_GRAFIKART}>`, embeds: [warnMessageLog] });

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

            console.info(`Reaction response 'Report' has responded to a reaction on the message ${message.id} in channel ${message.channel.id}.`);
        }
    }
}
