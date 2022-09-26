import { Colors, EmbedBuilder, Message } from "discord.js";
import Grafibot from "../utils/Grafibot";
import toFormatedTimestamp from "../utils/helpers/toFormatedTimestamp";
import BaseGrafibotFilter from "../utils/structures/BaseGrafibotFilter";
import { FilterScopeEnum, KnownErrorFilterErrorMap } from "../utils/types/GrafibotFilterTypes";

/**
 * Builds known erros map.
 */
const knownErrors = new Map<string, string>();
knownErrors
    .set('Cannot modify header information - headers already sent by', 'https://www.grafikart.fr/tutoriels/headers-already-sent-871')
    .set('Trying to get property of non-object', 'https://www.grafikart.fr/tutoriels/property-of-non-object-873')
    .set('Parse error: syntax error, unexpected', 'https://grafikart.fr/tutoriels/syntax-error-874')
    .set('Undefined index:', 'https://www.grafikart.fr/tutoriels/undefined-index-872')
    .set('Cannot read property', 'https://www.grafikart.fr/tutoriels/javascript-cannot-read-property-1348')
    .set('Cannot read properties', 'https://www.grafikart.fr/tutoriels/javascript-cannot-read-property-1348')
    .set('RegeneratorRuntime is not defined', 'https://www.grafikart.fr/tutoriels/javascript-regeneratorruntime-1349');

/**
 * Filter: Known error.
 * Detects messages that contains a known error then warns the author and log the incriminated message in the logs channel.
 */
export default class KnownErrorFilter extends BaseGrafibotFilter {
    private _knownErrors: Map<string, string>;

    constructor() {
        super(FilterScopeEnum.Message);

        this._knownErrors = knownErrors;
    }

    /**
     * Applies the filter to the message.
     * @param client - The Grafibot client.
     * @param message - The message received.
     */
    async run(client: Grafibot, message: Message): Promise<void> {
        const messageContent = message.content;

        let error: KnownErrorFilterErrorMap = new Object();

        this._knownErrors.forEach((value, key) => {
            if (messageContent.match(new RegExp(key, 'mi')) !== null) {
                error = { key: key, value: value };
            }
        });

        if (error.key && error.value) {
            // Builds and sends as a message reply the warn message.
            const warnMessage = new EmbedBuilder()
                .setColor(Colors.Green)
                .setTitle('Je peux t\'aider !')
                .setDescription(`Hey, je connais cette erreur !\n\nRegarde [cette vidéo](${error.value}), elle t'aidera à mieux de quoi il en retourne.`)
                .setImage('https://c.tenor.com/mB47f7y-fM8AAAAC/raccoon-hello-sewer.gif');

            await message.reply({ embeds: [warnMessage] });

            // Builds and sends the log message in the logs channel then reply to this message with the incriminated message.
            const warnMessageLog = new EmbedBuilder()
                .setColor(Colors.Green)
                .setTitle('Filtre: Erreur connue')
                .setDescription(`Le message en réponse à celui-ci contient l'erreur connue \`${error.key}\`.`)
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

            console.info(`The message ${message.id} has been filtered by the filter 'Known error' in channel ${message.channel.id}.`);
        }
    }
}
