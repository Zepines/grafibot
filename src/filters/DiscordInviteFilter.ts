import { Colors, EmbedBuilder, GuildMember, Message } from "discord.js";
import Grafibot from "../utils/Grafibot";
import toFormatedTimestamp from "../utils/helpers/toFormatedTimestamp";
import BaseGrafibotFilter from "../utils/structures/BaseGrafibotFilter";
import { DefaultReason, DurationInSeconds } from "../utils/types/GenericTypes";
import { FilterScopeEnum } from "../utils/types/GrafibotFilterTypes";

/**
 * Filter: Discord invite.
 * Detects messages that contains a Discord invite link then warns and mute the author and log the incriminated message in the logs channel.
 */
export default class DiscordInviteFilter extends BaseGrafibotFilter {
    constructor() {
        super(FilterScopeEnum.Message);
    }

    /**
     * Applies the filter to the message.
     * @param client - The Grafibot client.
     * @param message - The message received.
     */
    async run(client: Grafibot, message: Message): Promise<void> {
        const regex          = /(discord\.(gg|io|me|li)\/[0-9A-Za-z]+|discordapp\.com\/(invite|oauth2))/i;
        const messageContent = message.content;
        const author         = message.member;
        const reason         = DefaultReason.DiscordLink;
        const duration       = DurationInSeconds.TenMinutes;

        const appliesFilter = messageContent.match(regex);

        if (appliesFilter && author instanceof GuildMember) {
            await message.delete();

            await author.timeout(duration * 1000, reason);

            // Builds and sends the mute success log message in the logs channel.
            const muteAddSuccessLog = new EmbedBuilder()
                .setColor(Colors.Green)
                .setTitle('Filtre: Lien d\'invitation Dicord')
                .setDescription(`Le message en réponse à celui-ci contient un lien d'invitation Discord.\nLe membre <@${author.id}> a été mis en sourdine et son message supprimé.`)
                .addFields(
                    { name: 'Raison', value: reason },
                    { name: 'Durée', value: `${duration} secondes.` }
                )
                .setTimestamp();

            const loggedMessage = await client.logger.log({ content: `<@${process.env.USER_ID_GRAFIKART}>`, embeds: [muteAddSuccessLog] });

            const logMessageReply = new EmbedBuilder()
                .setColor(Colors.Blurple)
                .setTitle(`Message ${message.id}`)
                .setFields(
                    { name: 'Auteur', value: `<@${message.author.id}>` },
                    { name: 'Salon', value: `<#${message.channel.id}>` },
                    { name: 'Horodatage', value: toFormatedTimestamp(message.createdTimestamp) }
                );

            await loggedMessage.reply({ content: messageContent, embeds: [logMessageReply] });

            // Builds and sends an informational private message to the member.
            const muteAddSuccessPrivateMessage = new EmbedBuilder()
                .setColor(Colors.Blurple)
                .setTitle('Tu as été mis en sourdine')
                .setDescription(`Tu as été mis en sourdine pour la raison \`${reason}\`.\n\nMerci de respecter les <#${process.env.CHANNEL_ID_RULES}> du serveur.`)
                .setTimestamp();

            try {
                await author.send({ embeds: [muteAddSuccessPrivateMessage] });
            } catch (err) {
                console.info(`Unable to send a private message because the member ${author.id} has restricted his private messages.`);
            }

            console.info(`The message ${message.id} has been filtered by the filter 'Discord invite' in channel ${message.channel.id}.`);
        }
    }
}
