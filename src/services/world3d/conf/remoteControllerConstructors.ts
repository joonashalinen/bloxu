import CreatureBody from "../../../components/objects3d/pub/creatures/CreatureBody";
import RemoteCreatureBodyController from "../../../components/objects3d/pub/io/RemoteCreatureBodyController";
import { TControllerConstructors } from "./controllerConstructors";

export default function createRemoteControllerConstructors(
    controllerConstructors: TControllerConstructors) {
    return {
        "RemoteCreatureBodyController": (creatureBody: CreatureBody) => {
            const controller = controllerConstructors["CreatureBodyController"](creatureBody);
            const remoteController = new RemoteCreatureBodyController(controller);
            remoteController.setStateProperties = controller.extractStateProperties;
            return remoteController;
        }
    };
}