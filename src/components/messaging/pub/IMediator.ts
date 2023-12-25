import DMediatorMessage from "./DMediatorMessage";
import IMessenger from "./IMessenger";

/**
 * Object that serves as an intermediate 
 * for facilitating message sending between different parties.
 */
export interface IMediator<I, R> extends IMessenger<DMediatorMessage<I>, DMediatorMessage<R>> {
    actors: {[name: string]: IMessenger<unknown, unknown>};
    /**
     * Listen only to messages for actor with given name.
     */
    onMessageFor(actor: string, handler: (msg: DMediatorMessage<R>) => void): IMediator<I, R>;
}