export default interface IMessenger<A, B> {
    /**
     * Post a message.
     */
    postMessage(msg: A): IMessenger<A, B>;
    /**
     * Listen to incoming messages.
     */
    onMessage(handler: (msg: B) => void): IMessenger<A, B>;
}