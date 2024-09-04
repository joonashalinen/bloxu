import Channel from "../../../components/messaging/pub/Channel";
import { DMessage } from "../../../components/messaging/pub/DMessage";
import ProxyMessenger from "../../../components/messaging/pub/ProxyMessenger";
import CreatureBody from "../../../components/objects3d/pub/creatures/CreatureBody";
import World3D from "../../world3d/pub/World3D";
import LevelLogic from "../prv/LevelLogic";
import getLevels from "./levels";

export default function createLevelLogic(proxyMessenger: ProxyMessenger<DMessage, DMessage>) {
    const levelLogic = new LevelLogic();
    const playerChannels = [1, 2].map((num) =>
        new Channel("gameMaster", "player-" + num, proxyMessenger));
    const worldChannel = new Channel("gameMaster", "world3d", proxyMessenger);
    let playerBodiesInPortal = [];

    levelLogic.levels = getLevels();

    levelLogic.handleStartLevel = async () => {
        const playerBodyIds = [];
        for (let i = 0; i < playerChannels.length; i++) {
            const playerBodyId = await playerChannels[i].request("bodyId", []);
            playerBodyIds.push(playerBodyId);
        }

        const setPortalEnterListener = function (this: World3D, body: CreatureBody) {
            body.asPhysical.physicsAggregate.body.getCollisionObservable().add((event) => {
                if (event.collidedAgainst.transformNode.id.includes("Interactables::portal")) {
                    this.proxyMessenger.postMessage(
                        this.messageFactory.createEvent("gameMaster",
                            "GameMaster<event>playerEnterPortal", [body.id])
                    );
                }
            });
            return true;
        };

        for (let i = 0; i < playerBodyIds.length; i++) {
            await worldChannel.request("modifyObject",
                [playerBodyIds[i], {boundArgs: [], f: setPortalEnterListener}]);
        }
    };

    levelLogic.handleEndLevel = () => {
        playerBodiesInPortal = [];
    };

    levelLogic.handleEvent = async (type: string, args: unknown[]) => {
        if (type === "GameMaster<event>playerEnterPortal") {
            const playerBodyId= args[0] as string;
            if (!playerBodiesInPortal.includes(playerBodyId)) {
                playerBodiesInPortal.push(playerBodyId);
                if (playerBodiesInPortal.length === playerChannels.length) {
                    levelLogic.currentLevelIndex++;
                    levelLogic.emitter.trigger("endLevel",
                        [levelLogic.levels[levelLogic.currentLevelIndex]]);
                }
            }
        }
    };

    return levelLogic;
}