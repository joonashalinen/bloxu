import ArithmeticSequence from "../../math/pub/ArithmeticSequence";
import StringSequence from "../../strings/pub/StringSequence";
import { DMessage } from "./DMessage";
import IMessenger from "./IMessenger";

/**
 * Provides the ability to perform synchronous messaging 
 * with an IMessenger.
 */
export default class SyncMessenger {
    messenger: IMessenger<DMessage, DMessage>;
    idGenerator = new StringSequence(new ArithmeticSequence());

    constructor(messenger: IMessenger<DMessage, DMessage>) {
        this.messenger = messenger;
    }

    /**
     * Posts a synchronous message that will yield 
     * a response as a result.
     */
    async postSyncMessage(req: DMessage): Promise<Array<unknown>> {
        if (req.id === undefined) {
            req.id = req.sender + ":" + this.idGenerator.next();
        }

        const waitForResponse = new Promise<Array<unknown>>((resolve) => {
            this.messenger.onMessage((res: DMessage) => {
                if (res.type === "response" && res.id === req.id) {
                    resolve(res.message.args);
                }
            });
        });
        
        this.messenger.postMessage(req);
        return await waitForResponse;
    }
}