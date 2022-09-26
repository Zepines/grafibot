import { ChatInputCommandInteraction, Colors, EmbedBuilder, GuildMember, PermissionFlagsBits, SlashCommandBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import Grafibot from "../utils/Grafibot";
import BaseGrafibotSlashCommand from "../utils/structures/BaseGrafibotSlashCommand";
import { DurationInSeconds } from "../utils/types/GenericTypes";

/**
 * Slash command: sourdine.
 * This command is used to manage guild mutes.
 */
export default class MuteApplicationSlashCommand extends BaseGrafibotSlashCommand {
    constructor() {
        /**
         * Subcommand: ajouter.
         * Builds the data for the Discord API for the subcommand 'ajouter'.
         * This subcommand is used to mute a member.
         */
        const subcommand_add = new SlashCommandSubcommandBuilder()
            .setName('ajouter')
            .setDescription('Mettre un membre en sourdine')
            .addUserOption(option => option
                .setRequired(true)
                .setName('membre')
                .setDescription('Membre ciblé')
            )
            .addNumberOption(option => option
                .setRequired(true)
                .setName('durée')
                .setDescription('Durée de la mise en sourdine')
                .setChoices(
                    { name: '1 semaine', value: DurationInSeconds.OneWeek },
                    { name: '1 jour', value: DurationInSeconds.OneDay },
                    { name: '1 heure', value: DurationInSeconds.OneHour },
                    { name: '10 minutes', value: DurationInSeconds.TenMinutes },
                    { name: '5 minutes', value: DurationInSeconds.FiveMinutes },
                    { name: '1 minute', value: DurationInSeconds.OneMinute }
                )
            )
            .addStringOption(option => option
                .setName('raison')
                .setDescription('Raison de la mise en sourdine')
            );

        /**
         * Subcommand: retirer.
         * Builds the data for the Discord API for the subcommand 'retirer'.
         * This subcommand will is used to unmute a member.
         */
        const subcommand_remove = new SlashCommandSubcommandBuilder()
            .setName('retirer')
            .setDescription('Permettre à un membre de parler à nouveau')
            .addUserOption(option => option
                .setRequired(true)
                .setName('membre')
                .setDescription('Membre ciblé')
            );

        /**
         * Command: sourdine.
         * Builds the data for the Discord API for the command 'sourdine'.
         * This command is used to manage guild mutes.
         */
        const command = new SlashCommandBuilder()
            .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers)
            .setName('sourdine')
            .setDescription('Gérer les mise en sourdine')
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
                await this._muteAdd(client, interaction);
                break;
            case 'retirer':
                await this._muteRemove(client, interaction);
                break;
            default:
                throw new Error('An error occured while trying to routes a "sourdine" command subcommand.');
        }
    }

    /**
     * Handles the subcommand 'ajouter'.
     * Mutes the targeted member and sends log in the log channel.
     * @param client - The Grafibot client.
     * @param interaction - The interaction received.
     */
    private async _muteAdd(client: Grafibot, interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply({ ephemeral: true });

        // Retrieves data.
        const author = interaction.user;

        const optionMember   = interaction.options.getMember('membre');
        const optionDuration = interaction.options.getNumber('durée');
        const optionReason   = interaction.options.getString('raison');

        const target   = optionMember instanceof GuildMember ? optionMember : null;
        const duration = optionDuration ? optionDuration : DurationInSeconds.TenMinutes;
        const reason   = optionReason ? optionReason : `Aucune raison donnée.`;

        // Mutes the member, sends confirmation, logs that in the logs channel and inform the targeted member in private message.
        if (target) {
            try {
                await target.timeout(duration * 1000, reason);

                // Builds and sends as an interaction reply the success message.
                const muteAddSuccess = new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle('Membre mis en sourdine')
                    .setDescription(`Le membre <@${target.id}> a été mis en sourdine.`)
                    .addFields(
                        { name: 'Raison', value: reason },
                        { name: 'Durée', value: `${duration} secondes.` }
                    )
                    .setTimestamp();

                await interaction.editReply({ embeds: [muteAddSuccess] });

                // Builds and sends the success log message in the logs channel.
                const muteAddSuccessLog = new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle('Membre mis en sourdine')
                    .setDescription(`Le membre <@${target.id}> a été mis en sourdine.`)
                    .addFields(
                        { name: 'Raison', value: reason },
                        { name: 'Durée', value: `${duration} secondes.` },
                        { name: 'Auteur', value: `<@${author.id}>` }
                    )
                    .setTimestamp();

                await client.logger.log({ embeds: [muteAddSuccessLog] });

                // Builds and sends an informational private message to the member.
                const muteAddSuccessPrivateMessage = new EmbedBuilder()
                    .setColor(Colors.Blurple)
                    .setTitle('Tu as été mis en sourdine')
                    .setDescription(`Tu as été mis en sourdine pour la raison \`${reason}\`.\n\nMerci de respecter les <#${process.env.CHANNEL_ID_RULES}> du serveur.`)
                    .setTimestamp();

                try {
                    await target.send({ embeds: [muteAddSuccessPrivateMessage] });
                } catch (err) {
                    console.info(`Unable to send a private message because the member ${target.id} has restricted his private messages.`);
                }

                console.info(`The member ${target.id} has been muted by ${author.id}.`);
            } catch (err) {
                // Builds and sends as an interaction reply the error message.
                const muteAddError = new EmbedBuilder()
                    .setColor(Colors.Red)
                    .setTitle('Impossible de mettre le membre en sourdine')
                    .setDescription(`Une erreur est survenue en essayant de mettre en sourdine le membre <@${target.id}>.`)
                    .setTimestamp();

                await interaction.editReply({ embeds: [muteAddError] });

                // Builds and sends the error log message in the logs channel.
                const muteAddErrorLog = new EmbedBuilder()
                    .setColor(Colors.Red)
                    .setTitle('Impossible de mettre le membre en sourdine')
                    .setDescription(`Une erreur est survenue en essayant de mettre en sourdine le membre <@${target.id}>.`)
                    .addFields(
                        { name: 'Auteur', value: `<@${author.id}>`}
                    )
                    .setTimestamp();

                await client.logger.log({ embeds: [muteAddErrorLog] });

                console.error(`The following error occured while trying to mute the member ${target.id}:\n`, err);
            }
        }
    }

    /**
     * Handles the subcommand 'retirer'.
     * Unmutes the targeted member and sends log in the logs channel.
     * @param client - The Grafibot client.
     * @param interaction - The interaction received.
     */
    private async _muteRemove(client: Grafibot, interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply({ ephemeral: true });

        // Retrieves data.
        const author = interaction.user;

        const optionMember = interaction.options.getMember('membre');

        const target = optionMember instanceof GuildMember ? optionMember : null;

        // Unmutes the member, sends confirmation, logs that in the logs channel and inform the targeted member in private message.
        if (target) {
            try {
                await target.timeout(1);

                // Builds and sends as an interaction reply the success message.
                const muteRemoveSuccess = new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle('Annulation de la mise en sourdine')
                    .setDescription(`Le membre <@${target.id}> peut de nouveau communiquer.`)
                    .setTimestamp();

                await interaction.editReply({ embeds: [muteRemoveSuccess] });

                // Builds and sends the success log message in the logs channel.
                const muteRemoveSuccessLog = new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle('Annulation de la mise en sourdine')
                    .setDescription(`Le membre <@${target.id}> peut de nouveau communiquer.`)
                    .addFields(
                        { name: 'Auteur', value: `<@${author.id}>` }
                    )
                    .setTimestamp();

                await client.logger.log({ embeds: [muteRemoveSuccessLog] });

                // Builds and sends an informational private message to the member.
                const muteRemoveSuccessPrivateMessage = new EmbedBuilder()
                    .setColor(Colors.Blurple)
                    .setTitle('Annulation de la mise en sourdine')
                    .setDescription('Tu peux de nouveau communiquer.')
                    .setTimestamp();

                try {
                    await target.send({ embeds: [muteRemoveSuccessPrivateMessage] });
                } catch (err) {
                    console.info(`Unable to send a private message because the member ${target.id} has restricted his private messages.`);
                }

                console.info(`The member ${target.id} has been unmuted by ${author.id}.`);
            } catch (err) {
                // Builds and sends as an interaction reply the error message.
                const muteRemoveError = new EmbedBuilder()
                    .setColor(Colors.Red)
                    .setTitle('Impossible d\'annuler la mise en sourdine')
                    .setDescription(`Une erreur est survenue en essayant d'annuler la mise en sourdine du membre <@${target.id}>.`)
                    .setTimestamp();

                await interaction.editReply({ embeds: [muteRemoveError] });

                // Builds and sends the error log message in the logs channel.
                const muteRemoveErrorLog = new EmbedBuilder()
                    .setColor(Colors.Red)
                    .setTitle('Impossible d\'annuler la mise en sourdine')
                    .setDescription(`Une erreur est survenue en essayant d'annuler la mise en sourdine du membre <@${target.id}>.`)
                    .addFields(
                        { name: 'Auteur', value: `<@${author.id}>`}
                    )
                    .setTimestamp();

                await client.logger.log({ embeds: [muteRemoveErrorLog] });

                console.error(`The following error occured while trying to unmute the member ${target.id}:\n`, err);
            }
        }
    }
}
