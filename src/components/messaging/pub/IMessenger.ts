export default interface IMessenger<A, B> {
    /**
     * Post a message.
     */
    postMessage(msg: A): IMessenger<A, B>;
    /**
     * Listen to incoming messages.
     */
    onMessage(handler: (msg: B) => void): IMessenger<A, B>;
    /**
     * Remove listeners that were set with the given event handler.
     */
    offMessage(handler: (msg: B) => void): IMessenger<A, B>;
}