import { GuildMember, Message } from "discord.js";
import Grafibot from "../Grafibot";
import { FilterScopeEnum } from "../types/GrafibotFilterTypes";

/**
 * Represents an interaction filter.
 * Used to apply rules to a received interaction, like moderating messages.
 */
export default abstract class BaseGrafibotFilter {
    private _scope: FilterScopeEnum

    /**
     * Interaction filter constructor.
     * @param scope - The filter interaction scope.
     */
    constructor(scope: FilterScopeEnum) {
        this._scope = scope;
    }

    /**
     * Getter for the filter scope.
     */
    get scope(): FilterScopeEnum {
        return this._scope;
    }

    /**
     * Execute the interaction filter.
     * @param client - The Grafibot client.
     * @param interaction - The interaction received.
     */
    abstract run(client: Grafibot, interaction: Message | GuildMember): Promise<void>
}
