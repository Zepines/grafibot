import { ChatInputCommandInteraction, Colors, EmbedBuilder, GuildMember, PermissionFlagsBits, SlashCommandBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import Grafibot from "../utils/Grafibot";
import BaseGrafibotSlashCommand from "../utils/structures/BaseGrafibotSlashCommand";
import { DefaultReason, DurationInSeconds } from "../utils/types/GenericTypes";

/**
 * Slash command: bannir.
 * This command is used to manage guild bans.
 */
export default class BanApplicationSlashCommand extends BaseGrafibotSlashCommand {
    constructor() {
        /**
         * Subcommand: ajouter.
         * Builds the data for the Discord API for the subcommand 'ajouter'.
         * This subcommand is used to ban a member.
         */
        const subcommand_add = new SlashCommandSubcommandBuilder()
            .setName('ajouter')
            .setDescription('Bannir un membre')
            .addUserOption(option => option
                .setName('membre')
                .setDescription('Membre ciblé')
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName('raison')
                .setDescription('Raison du bannissement')
            )
            .addNumberOption(option => option
                .setName('supprimer_messages')
                .setDescription('Période de l\'historique des messages de ce membre à supprimer. Dernière heure par défaut.')
                .setChoices(
                    { name: '7 derniers jours', value: DurationInSeconds.OneWeek },
                    { name: '3 derniers jours', value: DurationInSeconds.ThreeDays },
                    { name: '24 dernières heures', value: DurationInSeconds.OneDay },
                    { name: '12 dernières heures', value: DurationInSeconds.TwelveHours },
                    { name: '6 dernières heures', value: DurationInSeconds.SixHours },
                    { name: 'Dernière heure', value: DurationInSeconds.OneHour },
                    { name: 'Ne rien supprimer', value: DurationInSeconds.Zero }
                )
            );

        /**
         * Subcommand: retirer.
         * Builds the data for the Discord API for the subcommand 'retirer'.
         * This subcommand is used to unban a member.
         */
        const subcommand_remove = new SlashCommandSubcommandBuilder()
            .setName('retirer')
            .setDescription('Débannir un membre')
            .addUserOption(option => option
                .setRequired(true)
                .setName('membre')
                .setDescription('Membre ciblé')
            );

        /**
         * Command: bannir.
         * Build the data for the Discord for the command 'bannir'.
         * This command is used to manage guild bans.
         */
        const command = new SlashCommandBuilder()
            .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
            .setDMPermission(false)
            .setName('bannir')
            .setDescription('Gérer les bannissements')
            .addSubcommand(subcommand_add)
            .addSubcommand(subcommand_remove);

        super({ name: command.name, commandJSON: command.toJSON() });
    }

    /**
     * Routes the subcommands.
     * @param client - The Grafibot client.
     * @param interaction - The interaction received.
     */
    async run(client: Grafibot, interaction: ChatInputCommandInteraction): Promise<void> {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'ajouter':
                await this._banAdd(client, interaction);
                break;
            case 'retirer':
                await this._banRemove(client, interaction);
                break;
            default:
                throw new Error('An error occured while trying to routes a "bannir" command subcommand.');
        }
    }

    /**
     * Handles the subcommand 'ajouter'.
     * Bans the targeted member and sends log in the logs channel.
     * @param client - The Grafibot client.
     * @param interaction - The interaction received.
     */
    private async _banAdd(client: Grafibot, interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply({ ephemeral: true });

        // Retrieves data.
        const author = interaction.user;

        const optionMember        = interaction.options.getMember('membre');
        const optionReason        = interaction.options.getString('raison');
        const optionDeleteHistory = interaction.options.getNumber('supprimer_messages');

        const target        = optionMember instanceof GuildMember ? optionMember : null;
        const reason        = optionReason ? optionReason : DefaultReason.NoReasonGiven;
        const deleteHistory = optionDeleteHistory ? optionDeleteHistory : DurationInSeconds.OneHour;

        // Bans the member, sends confirmation, logs that in the logs channel and inform the targeted member in private message.
        if (target) {
            try {
                await target.ban({
                    deleteMessageSeconds: deleteHistory,
                    reason: reason
                });

                const deleteHistoryReadable = deleteHistory > 0 ? `Tous les messages des ${deleteHistory} dernières secondes.` : `Aucun message.`;

                // Builds and sends as an interaction reply the success message.
                const banAddSuccess = new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle('Membre bannis')
                    .setDescription(`Le membre <@${target.id}> a été bannis.`)
                    .addFields(
                        { name: 'Raison', value: reason },
                        { name: 'Messages supprimés', value: deleteHistoryReadable }
                    )
                    .setTimestamp();

                await interaction.editReply({ embeds: [banAddSuccess] });

                // Builds and sends the success log message in the logs channel.
                const banAddSuccessLog = new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle('Membre bannis')
                    .setDescription(`Le membre <@${target.id}> a été bannis.`)
                    .addFields(
                        { name: 'Raison', value: reason },
                        { name: 'Messages supprimés', value: deleteHistoryReadable },
                        { name: 'Auteur', value: `<@${author.id}>` }
                    )
                    .setTimestamp();

                await client.logger.log({ embeds: [banAddSuccessLog] });

                // Builds and sends an informational private message to the member.
                const banAddSuccessPrivateMessage = new EmbedBuilder()
                    .setColor(Colors.Blurple)
                    .setTitle('Tu as été bannis')
                    .setDescription(`Tu as été bannis du serveur ${interaction.guild?.name}.`)
                    .addFields(
                        { name: 'Raison', value: reason }
                    )
                    .setTimestamp();

                try {
                    await target.send({ embeds: [banAddSuccessPrivateMessage] });
                } catch (err) {
                    console.info(`Unable to send a private message because the member ${target.id} has restricted his private messages.`);
                }

                console.info(`The member ${target.id} has been banned by ${author.id}.`);
            } catch (err) {
                // Builds and sends as an interaction reply the error message.
                const banAddError = new EmbedBuilder()
                    .setColor(Colors.Red)
                    .setTitle('Impossible de bannir le membre')
                    .setDescription(`Une erreur est survenue en essayant de bannir le membre <@${target.id}>.`)
                    .setTimestamp();

                await interaction.editReply({ embeds: [banAddError] });

                // Builds and sends the error log message in the logs channel.
                const banAddErrorLog = new EmbedBuilder()
                    .setColor(Colors.Red)
                    .setTitle('Impossible de bannir le membre')
                    .setDescription(`Une erreur est survenue en essayant de bannir le membre <@${target.id}>.`)
                    .addFields(
                        { name: 'Raison', value: reason },
                        { name: 'Auteur', value: `<@${author.id}>` }
                    )
                    .setTimestamp();

                await client.logger.log({ embeds: [banAddErrorLog] });

                console.error(`The following error occured while trying to ban the member ${target.id}:\n`, err);
            }
        }
    }

    /**
     * Handles the subcommand 'retirer'.
     * Unbans the targeted member and sends log in the logs channel.
     * @param client - The Grafibot client.
     * @param interaction - The interaction received.
     */
    private async _banRemove(client: Grafibot, interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply({ ephemeral: true });

        // Retrieves data.
        const author = interaction.user;

        const optionMember = interaction.options.getUser('membre');

        const target = optionMember instanceof GuildMember ? optionMember : null;

        // Unbans the member, sends confirmation, logs that in the logs channel and inform the targeted member in private message.
        if (target) {
            try {
                await interaction.guild?.bans.remove(target.id);

                // Builds and sends as an interaction reply the success message.
                const banRemoveSuccess = new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle('Membre débannis')
                    .setDescription('Le membre <@${target.id}> a été débannis.')
                    .setTimestamp();

                await interaction.editReply({ embeds: [banRemoveSuccess] });

                // Builds and sends the success log message in the logs channel.
                const banRemoveSuccessLog = new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle('Membre débannis')
                    .setDescription(`Le membre <@${target.id}> a été débannis.`)
                    .addFields(
                        { name: 'Auteur', value: `<@${author.id}>` }
                    )
                    .setTimestamp();

                await client.logger.log({ embeds: [banRemoveSuccessLog] });

                // Builds and sends an informational private message to the member.
                const banRemoveSuccessPrivateMessage = new EmbedBuilder()
                    .setColor(Colors.Blurple)
                    .setTitle('Tu as été débannis')
                    .setDescription(`Tu as été débannis du serveur ${interaction.guild?.name}, tu peux donc de nouveau le rejoindre.`)
                    .setTimestamp();

                try {
                    await target.send({ embeds: [banRemoveSuccessPrivateMessage] });
                } catch (err) {
                    console.info(`Unable to send a private message because the member ${target.id} has restricted his private messages.`);
                }

                console.info(`The member ${target.id} has been unbanned by ${author.id}.`);
            } catch (err) {
                // Builds and sends as an interaction the error message
                const banRemoveError = new EmbedBuilder()
                    .setColor(Colors.Red)
                    .setTitle('Impossible de débannir le membre')
                    .setDescription(`Une erreur est survenue en essayant de débannir le membre <@${target.id}>.`)
                    .setTimestamp();

                await interaction.editReply({ embeds: [banRemoveError] });

                // Builds and sends the error log message in the logs channel
                const banRemoveErrorLog = new EmbedBuilder()
                    .setColor(Colors.Red)
                    .setTitle('Impossible de débannir le membre')
                    .setDescription(`Une erreur est survenue en essayant de débannir le membre <@${target.id}>.`)
                    .addFields(
                        { name: 'Auteur', value: `<@${author.id}>` }
                    )
                    .setTimestamp();

                await client.logger.log({ embeds: [banRemoveErrorLog] });

                console.error(`The following error occured while trying to ban the member ${target.id}:\n`, err);
            }
        }
    }
}
