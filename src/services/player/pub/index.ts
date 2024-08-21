import WebWorker from "../../../components/browser/pub/WebWorker";
import { DMessage } from "../../../components/messaging/pub/DMessage";
import MessagePipe from "../../../components/messaging/pub/MessagePipe";
import MessengerClass from "../../../components/messaging/pub/MessengerClass";
import IService from "../../../components/services/pub/IService";
import IPlayer from "./IPlayer";
import Player from "./local/Player";
import RemotePlayer from "./remote/RemotePlayer";

function main() {
    var worker = new WebWorker(self);
    worker.onMessage((msg: DMessage) => {

        var player: IPlayer & IService;
        if (msg.type === "request" && msg.message.type === "beMainPlayer") {
            player = new Player(self.name);
            (player as Player).enableControls();
        } else if (msg.type === "request" && msg.message.type === "beRemotePlayer") {
            player = new RemotePlayer(self.name);
        } else if (msg.type === "request" && msg.message.type === "beAIPlayer") {
            player = new Player(self.name);
        }

        if (player !== undefined) {
            let playerMessenger = new MessengerClass(player, player.proxyMessenger, self.name);
            let pipe = new MessagePipe(worker, playerMessenger);
            pipe.join();
        }
    });

}

main();