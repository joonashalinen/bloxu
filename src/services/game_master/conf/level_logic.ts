import Channel from "../../../components/messaging/pub/Channel";
import { DMessage } from "../../../components/messaging/pub/DMessage";
import ProxyMessenger from "../../../components/messaging/pub/ProxyMessenger";
import CreatureBody from "../../../components/objects3d/pub/creatures/CreatureBody";
import Portal from "../../../components/objects3d/pub/Portal";
import World3D from "../../world3d/pub/World3D";
import LevelLogic from "../prv/LevelLogic";
import getLevels from "./levels";

export default function createLevelLogic(
    proxyMessenger: ProxyMessenger<DMessage, DMessage>) {
    // Create other service channels.
    const players = [1, 2].map((num) =>
        new Channel("gameMaster", "player-" + num, proxyMessenger));
    const playerCoordinator = new Channel("gameMaster", "playerCoordinator", proxyMessenger);
    const world = new Channel("gameMaster", "world3d", proxyMessenger);
    const allChannel = new Channel("gameMaster", "*", proxyMessenger);
    
    // Define variables shared by the level logic handlers.
    const playerBodyIds = [];
    let playerBodiesInPortal: string[] = [];
    
    // Finally, we configure the LevelLogic instance.

    const levelLogic = new LevelLogic();
    levelLogic.levels = getLevels();
    levelLogic.handleStartLevel = async () => {
        for (let i = 0; i < players.length; i++) {
            const playerBodyId = await (players[i].request("bodyId"));
            playerBodyIds.push(playerBodyId);
        }
        const setPortalEnterListener = function (this: World3D, body: CreatureBody) {
            body.asPhysical.physicsAggregate.body.getCollisionObservable().add((event) => {
                if (event.collidedAgainst.transformNode.id.includes("Interactables::portal")) {
                    this.proxyMessenger.postMessage(
                        this.messageFactory.createEvent("gameMaster",
                            "GameMaster:<event>playerEnterPortal", [body.id])
                    );
                }
            });
            return true;
        };

        for (let i = 0; i < playerBodyIds.length; i++) {
            await world.request("modifyObject",
                [playerBodyIds[i], {boundArgs: [], f: setPortalEnterListener}]);
        }
    };

    levelLogic.handleEndLevel = () => {
        playerBodiesInPortal = [];
    };

    levelLogic.handleEvent = async (type: string, args: unknown[]) => {
        if (type === "GameMaster:<event>playerEnterPortal") {
            const playerBodyId = args[0] as string;
            if (!playerBodiesInPortal.includes(playerBodyId)) {
                playerBodiesInPortal.push(playerBodyId);
                if (playerBodiesInPortal.length === players.length) {
                    levelLogic.currentLevelIndex++;
                    levelLogic.emitter.trigger("endLevel",
                        [levelLogic.levels[levelLogic.currentLevelIndex]]);
                }

                if (!levelLogic.isOnlineGame || playerBodyId.includes(levelLogic.localPlayerId)) {
                    allChannel.sendEvent("GameMaster:<event>playerEnterPortal", []);
                }
            }
        } else if (type === "IOService:<event>pressKey" && args[0] === "r") {
            const selectedPlayerId = levelLogic.isOnlineGame ?
                levelLogic.localPlayerId : 
                await playerCoordinator.request("selectedCreature") as string;
            const selectedPlayerBodyMeshId = playerBodiesInPortal.find((bodyId) =>
                bodyId.includes(selectedPlayerId));
            // If the selected player really is in the portal.
            if (selectedPlayerBodyMeshId !== undefined) {
                // Get the id of the player's body Object, which is different from
                // the mesh ids stored in playerBodiesInPortal.
                const selectedPlayerBodyId = playerBodyIds.find((bodyId) =>
                    bodyId.includes(selectedPlayerId));
                // Unteleport the player.
                unteleport(selectedPlayerBodyId, selectedPlayerBodyMeshId);

                allChannel.sendEvent("GameMaster:<event>playerLeavePortal", 
                    [selectedPlayerId, selectedPlayerBodyId, selectedPlayerBodyMeshId]);
            }
        } else if (type === "OnlineSynchronizer:GameMaster:<event>playerLeavePortal") {
            unteleport(args[1] as string, args[2] as string);
        }
    };

    async function unteleport(playerBodyId: string, playerBodyMeshId: string) {
        // The player should be marked as no longer in the portal.
        playerBodiesInPortal = playerBodiesInPortal.filter((bodyId) =>
            bodyId !== playerBodyMeshId);
        // Make the portal unteleport the player's body.
        await world.request("modifyObject",
            [playerBodyId, {boundArgs: [], f: function(this: World3D, body: CreatureBody) {
                const portal = this.getObject("Interactables::portal?0") as Portal;
                portal.unteleport(body);
            }}]);
    }

    return levelLogic;
}