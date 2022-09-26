import { Events } from "discord.js";
import Grafibot from "../Grafibot";

/**
 * Represents an application event receiver.
 */
export default abstract class BaseGrafibotEvent {
    private _type: Events

    /**
     * Application event receiver constructor.
     * @param type - The event type.
     */
    constructor(type: Events) {
        this._type = type;
    }

    /**
     * Getter for the event type.
     */
    get type(): Events {
        return this._type;
    }

    /**
     * Executes the event receiver.
     * @param client - The Grafibot client.
     * @param args - Optional arguments.
     */
    abstract run(client: Grafibot, ...args: any): void
}
