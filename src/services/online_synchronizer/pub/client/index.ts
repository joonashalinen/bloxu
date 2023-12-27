import WebWorker from "../../../../components/browser/pub/WebWorker";
import MessagePipe from "../../../../components/messaging/pub/MessagePipe";
import MessengerClass from "../../../../components/messaging/pub/MessengerClass";
import OnlineSynchronizerClient from "./OnlineSynchronizerClient";

function main() {
    var synchronizerClient = new OnlineSynchronizerClient();
    var worker = new WebWorker(self);
    var synchronizerClientMessenger = new MessengerClass(
        synchronizerClient, 
        synchronizerClient.proxyMessenger, 
        "onlineSynchronizerClient"
    );
    var pipe = new MessagePipe(worker, synchronizerClientMessenger);
    pipe.join();
}

main();