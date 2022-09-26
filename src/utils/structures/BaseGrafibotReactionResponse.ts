import { GuildMember, MessageReaction } from "discord.js";
import Grafibot from "../Grafibot";
import { GrafibotReactionResponseConstructorOptions } from "../types/GrafibotReactionResponseTypes";

/**
 * Represents a reaction response.
 * When a received message reaction match the rules, the corresponding instructions are executed.
 */
export default abstract class BaseGrafibotReactionResponse {
    private _emoji:           string;
    private _needsPriviledge: boolean;

    /**
     * Reaction response constructor.
     * @param param - The reaction constructor parameters.
     * @param param.emojiId - The emoji ID.
     * @param param.needsPriviledge - The reaction permission.
     */
    constructor({emoji, needsPriviledge}: GrafibotReactionResponseConstructorOptions) {
        this._emoji           = emoji;
        this._needsPriviledge = needsPriviledge;
    }

    /**
     * Getter for the emoji ID.
     */
    get emoji(): string {
        return this._emoji;
    }

    /**
     * Getter for the permission.
     */
    get needsPriviledge(): boolean {
        return this._needsPriviledge;
    }

    /**
     * Execute the reaction response.
     * @param client - The Grafibot client.
     * @param reaction - The intertaction received.
     * @param member - The member who has reacted.
     */
    abstract run(client: Grafibot, reaction: MessageReaction, member: GuildMember): Promise<void>
}
