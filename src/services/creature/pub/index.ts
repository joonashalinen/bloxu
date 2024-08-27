import WebWorker from "../../../components/browser/pub/WebWorker";
import { DMessage } from "../../../components/messaging/pub/DMessage";
import MessagePipe from "../../../components/messaging/pub/MessagePipe";
import MessengerClass from "../../../components/messaging/pub/MessengerClass";
import Creature from "./Creature";
import RemoteCreature from "./RemoteCreature";

function main() {
    var worker = new WebWorker(self);
    // Wait for a spawn request.
    worker.onMessage((msg: DMessage) => {
        const spawnRequestTypes = ["beCreature", "beRemoteCreature"];

        if (msg.type === "request" && spawnRequestTypes.includes(msg.message.type)) {
            var creature: Creature | RemoteCreature;
            const bodyType = msg.message.args[0] as string;
            if (typeof bodyType !== "string") {
                throw new Error(`No argument or incorrect argument was
                    given for the creature's body type.`);
            }

            if (msg.message.type === "beCreature") {
                creature = new Creature(self.name, bodyType);

                const enableControls = typeof msg.message.args[1] === "boolean" ?
                    msg.message.args[1] : false;
                if (enableControls) creature.enableControls();

            } else { // beRemoteCreature
                creature = new RemoteCreature(self.name, bodyType);
            }

            let creatureMessenger = new MessengerClass(creature, creature.proxyMessenger, self.name);
            let pipe = new MessagePipe(worker, creatureMessenger);
            pipe.join();
        }
    });

}

main();