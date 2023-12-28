import { DMessage } from "./DMessage";

/**
 * Factory for creating objects implementing the
 * DMessage interface.
 */
export default class MessageFactory {
    constructor(public sender: string) {
        
    }

    /**
     * Create a new request DMessage.
     */
    createRequest(recipient: string, type: string, args: Array<unknown> = []): DMessage {
        return {
            recipient: recipient,
            sender: this.sender,
            type: "request",
            message: {
                type: type,
                args: args
            }
        };
    }

    /**
     * Create a new event DMessage.
     */
    createEvent(recipient: string, type: string, args: Array<unknown> = []): DMessage {
        return {
            recipient: recipient,
            sender: this.sender,
            type: "event",
            message: {
                type: type,
                args: args
            }
        };
    }

    /**
     * Create a new response DMessage.
     */
    createResponse(recipient: string, type: string, args: Array<unknown> = []): DMessage {
        return {
            recipient: recipient,
            sender: this.sender,
            type: "event",
            message: {
                type: type,
                args: args
            }
        };
    }
}