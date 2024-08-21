import WebWorker from "../../../components/browser/pub/WebWorker";
import MessagePipe from "../../../components/messaging/pub/MessagePipe";
import MessengerClass from "../../../components/messaging/pub/MessengerClass";
import PlayerCoordinator from "./PlayerCoordinator";

function main() {
    var gameMaster = new PlayerCoordinator();
    var worker = new WebWorker(self);
    var gameMasterMessenger = new MessengerClass(
        gameMaster, 
        gameMaster.proxyMessenger,
        "gameMaster"
    );
    var pipe = new MessagePipe(worker, gameMasterMessenger);
    pipe.join();
}

main();