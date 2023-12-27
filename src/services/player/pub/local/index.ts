import WebWorker from "../../../../components/browser/pub/WebWorker";
import MessagePipe from "../../../../components/messaging/pub/MessagePipe";
import MessengerClass from "../../../../components/messaging/pub/MessengerClass";
import Player from "./Player";

function main() {
    var player = new Player();
    var worker = new WebWorker(self);
    var playerMessenger = new MessengerClass(player, player.emitter);
    var pipe = new MessagePipe(worker, playerMessenger);
    pipe.join();
}

main();