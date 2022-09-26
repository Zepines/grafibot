import { ChatInputCommandInteraction, Colors, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from "discord.js";
import Grafibot from "../utils/Grafibot";
import toFormatedTimestamp from "../utils/helpers/toFormatedTimestamp";
import BaseGrafibotSlashCommand from "../utils/structures/BaseGrafibotSlashCommand";
import { DefaultReason } from "../utils/types/GenericTypes";

/**
 * Slash command: nettoyer.
 * This command is used to bulk delete messages in a channel.
 */
export default class CleanApplicationSlashCommand extends BaseGrafibotSlashCommand {
    constructor() {
        /**
         * Command: nettoyer.
         * Builds the data for the Discord API for the command 'nettoyer'.
         * This command is used to bulk delete messages in a channel.
         */
        const command = new SlashCommandBuilder()
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
            .setDMPermission(false)
            .setName('nettoyer')
            .setDescription('Supprimer plusieurs messages')
            .addNumberOption(option => option
                .setRequired(true)
                .setName('quantité')
                .setDescription('Le nombre de messages à supprimer')
            )
            .addStringOption(option => option
                .setName('raison')
                .setDescription('Raison de la suppression')
            )
            .addChannelOption(option => option
                .setName('salon')
                .setDescription('Le salon où les messages seront supprimés. Laisser vide pour supprimer dans le salon courant.')
            );

        super({ name: command.name, commandJSON: command.toJSON() });
    }

    /**
     * Executes the command.
     * Bulk delete messages in a channel and sends a copy of them in the logs channel.
     * @param client - The Grafibot client.
     * @param interaction - The interaction received.
     */
    async run(client: Grafibot, interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply({ ephemeral: true });

        // Retrieves data.
        const author = interaction.user;

        const optionQuantity = interaction.options.getNumber('quantité')!;
        const optionReason   = interaction.options.getString('raison');
        const optionChannel  = interaction.options.getChannel('salon');

        const reason  = optionReason ? optionReason : DefaultReason.NoReasonGiven;
        const channel = optionChannel instanceof TextChannel ? optionChannel : interaction.channel as TextChannel;

        // Bulk delete messages in the channel and sends a copy of them in the logs channel.
        if (channel) {
            try {
                // Fetches messages.
                const messages = await channel.messages.fetch({ limit: optionQuantity });

                // Bulk delete messages.
                await channel.bulkDelete(messages);

                // Builds and sends as an interaction message the success message.
                const cleanSuccess = new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle('Messages supprimés')
                    .setDescription(`Les messages ont été supprimés.`)
                    .addFields(
                        { name: 'Raison', value: reason, inline: true },
                        { name: `Salon`, value: `<#${channel.id}>` },
                        { name: 'Nombre de messages supprimés', value: `${messages.size}`, inline: true }
                    )
                    .setTimestamp();

                await interaction.editReply({ embeds: [cleanSuccess] });

                // Builds and sends an informational message in the channel if a reason has been given.
                if (reason !== DefaultReason.NoReasonGiven) {
                    const cleanSuccessInformation = new EmbedBuilder()
                        .setColor(Colors.Blurple)
                        .setTitle('Des messages ont été supprimés')
                        .setDescription(`Plusieurs messages ont été supprimés dans ce salon (<#${channel.id}>).\nPensez à lire les <#${process.env.CHANNEL_ID_RULES}> !`)
                        .setFields(
                            { name: 'Raison', value: reason, inline: true },
                            { name: 'Nombre de messages supprimés', value: `${messages.size}`, inline: true }
                        )
                        .setImage('https://c.tenor.com/yBWlAJCeXNYAAAAC/broom-sweep.gif');

                    await channel.send({ embeds: [cleanSuccessInformation] });
                }

                // Builds and sends the success log message in the logs channel then reply to this message with all deleted messages.
                const cleanSuccessLog = new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle('Messages supprimés')
                    .setDescription(`Les ${messages.size} messages en réponse à celui-ci ont été supprimés.`)
                    .setFields(
                        { name: `Raison`, value: reason },
                        { name: `Salon`, value: `<#${channel.id}>` },
                        { name: `Auteur`, value: `<@${author.id}>` }
                    )
                    .setTimestamp();

                const loggedMessage = await client.logger.log({ embeds: [cleanSuccessLog] });

                messages.forEach(async (message, key) => {
                    let messageContent;

                    if (!message.cleanContent && message.embeds.length > 0) {
                        messageContent = `*Ce message était une intégration. Son contenu est disponible en réponse à ce message.*`;
                    } else {
                        messageContent = message.cleanContent;
                    } 

                    const logMessageReply = new EmbedBuilder()
                        .setColor(Colors.Blurple)
                        .setTitle(`Message ${key}`)
                        .setFields(
                            { name: 'Auteur', value: `<@${message.author.id}>` },
                            { name: 'Salon', value: `<#${message.channel.id}>` },
                            { name: 'Horodatage', value: toFormatedTimestamp(message.createdTimestamp) }
                        );

                    const loggedLogMessageReply = await loggedMessage.reply({ content: messageContent, embeds: [logMessageReply] });

                    if (!message.cleanContent && message.embeds.length > 0) {
                        await loggedLogMessageReply.reply({ embeds: message.embeds });
                    }
                });

                console.info(`${optionQuantity} messages have been deleted by ${author.id} in channel ${channel.id}.`);
            } catch (err) {
                // Builds and sends as an interaction reply the error message.
                const cleanError = new EmbedBuilder()
                    .setColor(Colors.Red)
                    .setTitle('Impossible de supprimer les messages')
                    .setDescription(`Une erreur est survenue en essayant de supprimer les ${optionQuantity} messages.`)
                    .setTimestamp();

                await interaction.editReply({ embeds: [cleanError] });

                // Builds and sends the error log message in the logs channel.
                const cleanErrorLog = new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle('Impossible de supprimer les messages')
                    .setDescription(`Une erreur est survenue en essayant de supprimer les ${optionQuantity} messages.`)
                    .setFields(
                        { name: 'Raison', value: reason },
                        { name: 'Auteur', value: `<@${author.id}>` }
                    )
                    .setTimestamp();

                await client.logger.log({ embeds: [cleanErrorLog] });

                console.error(`The following error occured while trying to bulk delete messages in channel ${channel.id}:\n`, err)
            }
        }
    }
}
