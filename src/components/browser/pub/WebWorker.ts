import IMessenger from "../../messaging/pub/IMessenger";

interface BrowserWebWorker {
    postMessage(msg: unknown): void;
    onmessage: Function;
}

/**
 * A web worker running on a browser.
 */
export default class WebWorker implements IMessenger<unknown, unknown> {
    worker: BrowserWebWorker;

    constructor(worker: BrowserWebWorker) {
        this.worker = worker;
    }

    postMessage(msg: unknown): IMessenger<unknown, unknown> {
        this.worker.postMessage(msg);
        return this;
    }

    onMessage(handler: Function): IMessenger<unknown, unknown> {
        this.worker.onmessage = handler;
        return this;
    }
}