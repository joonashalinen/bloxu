import StringSequence from "../../strings/pub/StringSequence";
import { DMessage } from "./DMessage";
import IMessenger from "./IMessenger";

/**
 * Provides the ability to perform synchronous messaging 
 * with an IMessenger.
 */
export default class SyncMessenger {
    messenger: IMessenger<DMessage, DMessage>;
    idGenerator: StringSequence;

    constructor(messenger: IMessenger<DMessage, DMessage>, idGenerator: StringSequence) {
        this.messenger = messenger;
        this.idGenerator = idGenerator;
    }

    /**
     * Posts a synchronous message that will yield 
     * a response as a result.
     */
    async postSyncMessage(req: DMessage): Promise<DMessage> {
        if (req.id === undefined) {
            req.id = this.idGenerator.next();
        }
        return new Promise((resolve) => {
            this.messenger.onMessage((res: DMessage) => {
                if (res.type === "response" && res.id === req.id) {
                    resolve(res);
                }
            });
        });
    }
}