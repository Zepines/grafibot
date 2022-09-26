import { Events, Message } from "discord.js";
import Grafibot from "../utils/Grafibot";
import BaseGrafibotEvent from "../utils/structures/BaseGrafibotEvent";
import { FilterScopeEnum } from "../utils/types/GrafibotFilterTypes";

/**
 * Event: Message create.
 * Emitted when a message is received.
 */
export default class MessageCreateEvent extends BaseGrafibotEvent {
    constructor() {
        super(Events.MessageCreate);
    }

    /**
     * Handles the received message.
     * @param client - The Grafibot client.
     * @param message - The message received.
     */
    async run(client: Grafibot, message: Message) {
        if (!message.author.bot) {
            client.regFilters.forEach(async filter => {
                if (filter.scope === FilterScopeEnum.Message) {
                    await filter.run(client, message);
                }
            });
        }
    }
}
