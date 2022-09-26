import { BaseInteraction, Events } from "discord.js";
import Grafibot from "../utils/Grafibot";
import BaseGrafibotEvent from "../utils/structures/BaseGrafibotEvent";

/**
 * Event: Interaction create.
 * Emitted when an interaction is received.
 */
export default class InteractionCreateEvent extends BaseGrafibotEvent {
    constructor() {
        super(Events.InteractionCreate);
    }

    /**
     * Handles the received interaction.
     * @param client - The Grafibot client.
     * @param interaction - The interaction received.
     */
    async run(client: Grafibot, interaction: BaseInteraction) {
        if (interaction.isChatInputCommand()) {
            const command = client.regCommands.get(interaction.commandName);

            if (command) {
                command.run(client, interaction);
            }
        }
    }
}
