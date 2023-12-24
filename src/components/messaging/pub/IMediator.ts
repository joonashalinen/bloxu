import DMessage from "./DMessage";
import IMessenger from "./IMessenger";

/**
 * Object that serves as an intermediate 
 * for facilitating message sending between different parties.
 */
export interface IMediator<I, R> extends IMessenger<DMessage<I>, DMessage<R>> {
    actors: {[name: string]: IMessenger<unknown, unknown>};
    /**
     * Listen only to messages for actor with given name.
     */
    onMessageFor(actor: string, handler: (msg: DMessage<R>) => void): IMediator<I, R>;
}