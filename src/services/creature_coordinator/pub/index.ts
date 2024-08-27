import WebWorker from "../../../components/browser/pub/WebWorker";
import MessagePipe from "../../../components/messaging/pub/MessagePipe";
import MessengerClass from "../../../components/messaging/pub/MessengerClass";
import CreatureCoordinator from "./CreatureCoordinator";

function main() {
    var creatureCoordinator = new CreatureCoordinator(self.name);
    var worker = new WebWorker(self);
    var creatureCoordinatorMessenger = new MessengerClass(
        creatureCoordinator, 
        creatureCoordinator.proxyMessenger,
        self.name
    );
    var pipe = new MessagePipe(worker, creatureCoordinatorMessenger);
    pipe.join();
}

main();