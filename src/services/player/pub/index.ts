import WebWorker from "../../../components/browser/pub/WebWorker";
import { DMessage } from "../../../components/messaging/pub/DMessage";
import MessagePipe from "../../../components/messaging/pub/MessagePipe";
import MessengerClass from "../../../components/messaging/pub/MessengerClass";
import Player from "./local/Player";
import RemotePlayer from "./remote/RemotePlayer";

function main() {
    var worker = new WebWorker(self);
    worker.onMessage((msg: DMessage) => {
        if (msg.type === "request" && msg.message.type === "beMainPlayer") {
            let player = new Player(self.name);
            let playerMessenger = new MessengerClass(player, player.proxyMessenger, self.name);
            let pipe = new MessagePipe(worker, playerMessenger);
            pipe.join();
            
        } else if (msg.type === "request" && msg.message.type === "beRemotePlayer") {
            let player = new RemotePlayer(self.name);
            let playerMessenger = new MessengerClass(player, player.player.proxyMessenger, self.name);
            let pipe = new MessagePipe(worker, playerMessenger);
            pipe.join();
        }
    });

}

main();