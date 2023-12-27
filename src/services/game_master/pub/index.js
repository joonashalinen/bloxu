import WebWorker from "../../../components/browser/pub/WebWorker";
import MessagePipe from "../../../components/messaging/pub/MessagePipe";
import MessengerClass from "../../../components/messaging/pub/MessengerClass";
import GameMaster from "./GameMaster";
function main() {
    var gameMaster = new GameMaster();
    var worker = new WebWorker(self);
    var gameMasterMessenger = new MessengerClass(gameMaster, gameMaster.emitter);
    var pipe = new MessagePipe(worker, gameMasterMessenger);
    pipe.join();
}
main();
//# sourceMappingURL=index.js.map