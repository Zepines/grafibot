import { RESTPostAPIApplicationCommandsJSONBody } from "discord.js";

/**
 * Types and enumerations for the application slash commands.
 */

/**
 * Type for the application slash command constructor.
 */
export type GrafibotSlashCommandConstructorOptions = {
    name:        string;
    commandJSON: RESTPostAPIApplicationCommandsJSONBody;
}
