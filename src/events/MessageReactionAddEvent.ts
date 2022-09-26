import { Events, GuildMember, MessageReaction, User } from "discord.js";
import Grafibot from "../utils/Grafibot";
import isPrivileged from "../utils/helpers/isPrivileged";
import BaseGrafibotEvent from "../utils/structures/BaseGrafibotEvent";

/**
 * Event: Message reaction add.
 * Emitted when a reaction is added to a message.
 */
export default class MessageReactionAddEvent extends BaseGrafibotEvent {
    constructor() {
        super(Events.MessageReactionAdd);
    }

    /**
     * Handles the received message reaction.
     * @param client - The Grafibot client.
     * @param reaction - The reaction received.
     */
    async run(client: Grafibot, reaction: MessageReaction, user: User) {
        let r: MessageReaction;

        // Fetch partial data
        if (reaction.partial) {
            r = await reaction.fetch();
        } else {
            r = reaction;
        }

        if (!user.bot) {
            const member = await r.message.guild?.members.fetch(user.id);

            if (member instanceof GuildMember) {
                const privileged = isPrivileged(member);

                client.regReactionsResponses.forEach(async reactionResponse => {
                    if (reactionResponse.needsPriviledge && privileged) {
                        await reactionResponse.run(client, r, member);
                    } else if (!reactionResponse.needsPriviledge) {
                        await reactionResponse.run(client, r, member)
                    }
                });
            }
        }
    }
}
