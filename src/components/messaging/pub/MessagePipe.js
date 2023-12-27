/**
 * Can be used to join two IMessengers so that messages received from either one are
 * forwarded to the other one.
 */
export default class MessagePipe {
    constructor(messenger1, messenger2) {
        this.messenger1 = messenger1;
        this.messenger2 = messenger2;
    }
    /**
     * Joins the two IMessengers.
     */
    join() {
        this.messenger1.onMessage(this.messenger2.postMessage.bind(this.messenger2));
        this.messenger2.onMessage(this.messenger1.postMessage.bind(this.messenger1));
        return this;
    }
}
//# sourceMappingURL=MessagePipe.js.map