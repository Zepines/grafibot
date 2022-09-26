import { CommandInteraction, RESTPostAPIApplicationCommandsJSONBody } from "discord.js";
import Grafibot from "../Grafibot";
import { GrafibotSlashCommandConstructorOptions } from "../types/GrafibotSlashCommandTypes";

/**
 * Represents an application slash command.
 */
export default abstract class BaseGrafibotSlashCommand {
    private _name: string
    private _commandJSON: RESTPostAPIApplicationCommandsJSONBody

    /**
     * Application slash command constructor.
     * @param param - The command constructor parameters.
     * @param param.name - The command name.
     * @param param.commandJSON - The command data in Discord API JSON format.
     */
    constructor({name, commandJSON}: GrafibotSlashCommandConstructorOptions) {
        this._name = name;
        this._commandJSON = commandJSON;
    }

    /**
     * Getter for the command name.
     */
    get name(): string {
        return this._name;
    }

    /**
     * Getter for the command data in Discord API JSON format.
     */
    get commandJSON(): RESTPostAPIApplicationCommandsJSONBody {
        return this._commandJSON;
    }

    /**
     * Executes the command.
     * @param client - The Grafibot client.
     * @param interaction - The interaction received.
     */
    abstract run(client: Grafibot, interaction: CommandInteraction): Promise<void>
}
