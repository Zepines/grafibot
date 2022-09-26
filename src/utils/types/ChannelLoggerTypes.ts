import { APIEmbed, JSONEncodable } from "discord.js"

/**
 * Types and enumerations for the channel logger.
 */

/**
 * Type for the log message.
 */
export type ChannelLoggerMessageOptions = {
    content?: string,
    embeds?:  Array<APIEmbed | JSONEncodable<APIEmbed>>
}
