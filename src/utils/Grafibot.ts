import { readdir } from "fs/promises";
import { join, parse } from "path";
import { Client, ClientOptions, Collection, REST, Routes } from "discord.js";
import BaseGrafibotSlashCommand from "./structures/BaseGrafibotSlashCommand";
import BaseGrafibotEvent from "./structures/BaseGrafibotEvent";
import ChannelLogger from "./ChannelLogger";
import BaseGrafibotFilter from "./structures/BaseGrafibotFilter";
import BaseGrafibotReactionResponse from "./structures/BaseGrafibotReactionResponse";

/**
 * Represents the client.
 */
export default class Grafibot extends Client {
    private _logger:                 ChannelLogger;
    private _regEvents             = new Collection<string, BaseGrafibotEvent>();
    private _regCommands           = new Collection<string, BaseGrafibotSlashCommand>();
    private _regFilters            = new Collection<string, BaseGrafibotFilter>();
    private _regReactionsResponses = new Collection<string, BaseGrafibotReactionResponse>();

    /**
     * The client constructor.
     * @param options - The client options.
     */
    constructor(options: ClientOptions) {
        super(options);

        this._logger = new ChannelLogger(this);
    }

    /**
     * Getter for the channel logger.
     */
    get logger(): ChannelLogger {
        return this._logger;
    }

    /**
     * Getter for the registred events
     */
    get regEvents(): Collection<string, BaseGrafibotEvent> {
        return this._regEvents;
    }

    /**
     * Getter for the registred commands.
     */
    get regCommands(): Collection<string, BaseGrafibotSlashCommand> {
        return this._regCommands;
    }

    /**
     * Getter for the registred filters.
     */
    get regFilters(): Collection<string, BaseGrafibotFilter> {
        return this._regFilters;
    }

    /**
     * Getter for the registred reactions reponses.
     */
    get regReactionsResponses(): Collection<string, BaseGrafibotReactionResponse> {
        return this._regReactionsResponses;
    }

    /**
     * Registers the application events in the client.
     */
    private async _registerEvents(): Promise<void> {
        console.info(`Started registering events.`);

        const folder = join(__dirname, '../events');
        const files = await readdir(folder);

        for (const file of files) {
            const { default: Event } = await import(join(`${folder}/${file}`));
            const event = new Event();

            this._regEvents.set(event.type, event);

            this.on(event.type, event.run.bind(event, this));
        }

        console.info(`Finished registering events.`);
    }

    /**
     * Registers the application slash commands in the client.
     */
    private async _registerCommands(): Promise<void> {
        console.info(`Started registering application slash commands.`);

        const folder = join(__dirname, '../commands');
        const files = await readdir(folder);

        for (const file of files) {
            const { default: Command } = await import(join(`${folder}/${file}`));
            const command = new Command();
    
            this._regCommands.set(command.name, command);
        }

        console.info(`Finished registering application slash commands.`);
    }

    /**
     * Registers the interaction filters in the client.
     */
    private async _registerFilters(): Promise<void> {
        console.info(`Started registering filters.`);

        const folder = join(__dirname, '../filters');
        const files = await readdir(folder);

        for (const file of files) {
            const { default: Filter } = await import(join(`${folder}/${file}`));
            const filter = new Filter();
    
            this._regFilters.set(parse(file).name, filter);
        }

        console.info(`Finished registering filters.`);
    }

    /**
     * Registers the reaction responses in the client.
     */
    private async _registerReactionResponses(): Promise<void> {
        console.info(`Started registering reactions responses.`);

        const folder = join(__dirname, '../reactionResponses');
        const files = await readdir(folder);

        for (const file of files) {
            const { default: ReactionResponse } = await import(join(`${folder}/${file}`));
            const reactionResponse = new ReactionResponse();
    
            this._regReactionsResponses.set(parse(file).name, reactionResponse);
        }

        console.info(`Finished registering reactions responses.`);
    }

    /**
     * Registers all components in the client.
     */
    async registerAllComponents(): Promise<void> {
        console.info(`Started registering all components.`);

        await this._registerEvents();
        await this._registerCommands();
        await this._registerFilters();
        await this._registerReactionResponses();

        console.info(`Finished registering all components.`);
    }

    /**
     * Deploys the application slash commands to the guild.
     */
    async deployCommands(): Promise<void> {
        const commands = [];

        for (const [, value] of this._regCommands.entries()) {
            commands.push(value.commandJSON);
        }

        const rest = new REST({ version: '10' }).setToken(process.env.CREDENTIAL_BOT_TOKEN);

        try {
            console.info('Started deploying application slash commands');

            await rest.put(
                Routes.applicationGuildCommands(process.env.CREDENTIAL_APPLICATION_ID, process.env.CREDENTIAL_GUILD_ID),
                { body: commands }
            );

            console.info(('Successfully deployed application slash commands'));
        } catch (err) {
            console.debug('The following error occured while deploying application slash commands:', err);

            throw new Error('An error occured while deploying application slash commands. Use the "debug" log level to log the received error.');
        }
    }
}
