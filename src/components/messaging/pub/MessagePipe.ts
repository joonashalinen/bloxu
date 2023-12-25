import IMessenger from "./IMessenger";

/**
 * Can be used to join two IMessengers so that messages received from either one are 
 * forwarded to the other one.
 */
export default class MessagePipe<A, B> {
    messenger1: IMessenger<A,B>;
    messenger2: IMessenger<B,A>;

    constructor(messenger1: IMessenger<A,B>, messenger2: IMessenger<B,A>) {
        this.messenger1 = messenger1;
        this.messenger2 = messenger2;
    }

    /**
     * Joins the two IMessengers.
     */
    join(): MessagePipe<A,B> {
        this.messenger1.onMessage(this.messenger2.postMessage.bind(this.messenger2));
        this.messenger2.onMessage(this.messenger1.postMessage.bind(this.messenger1));
        return this;
    }

}