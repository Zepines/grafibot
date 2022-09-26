import { Events, Message, TextChannel } from "discord.js";
import Grafibot from "./Grafibot";
import { ChannelLoggerMessageOptions } from "./types/ChannelLoggerTypes";

/**
 * Represents the channel logger.
 */
export default class ChannelLogger {
    private _channel!: TextChannel;

    constructor(client: Grafibot) {
        client.on(Events.ClientReady, () => {
            const channel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS);
    
            if (channel instanceof TextChannel) {
                this._channel = channel;
            } else {
                throw new Error(`Unable to find the logs channel with ID ${process.env.CHANNEL_ID_LOGS}`);
            }
        });
    }

    /**
     * Logs the message in the logs channel.
     * @param message - The message to send
     */
    async log({content, embeds}: ChannelLoggerMessageOptions): Promise<Message> {
        if (this._channel instanceof TextChannel) {
            return await this._channel.send({ content: content, embeds: embeds });
        } else {
            throw new Error(`Unable to find the logs channel with ID ${process.env.CHANNEL_ID_LOGS}`);
        }
    }
}
