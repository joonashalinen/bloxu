import DVector3 from "../../../../components/graphics3d/pub/DVector3";
import PlayerBody from "../../../world3d/conf/custom_object_types/PlayerBody";
import World3D from "../../../world3d/pub/World3D";
import IPlayer from "../IPlayer";
import Player, { DirectionEvent } from "../local/Player";
import DVector2 from "../../../../components/graphics3d/pub/DVector2";
import DPlayerBody from "../../../world3d/conf/custom_object_types/DPlayerBody";
import ShootState from "../../../world3d/conf/custom_object_types/ShootState";
import TStateResource from "../../../../components/objects3d/pub/creatures/TStateResource";
import JumpState from "../../../../components/objects3d/pub/creatures/JumpState";
import IService from "../../../../components/services/pub/IService";
import { DMessage } from "../../../../components/messaging/pub/DMessage";
import MessageFactory from "../../../../components/messaging/pub/MessageFactory";
import ProxyMessenger from "../../../../components/messaging/pub/ProxyMessenger";
import SyncMessenger from "../../../../components/messaging/pub/SyncMessenger";

/**
 * A Player that is controlled remotely by another online player.
 */
export default class RemotePlayer implements IPlayer, IService {
    player: Player;
    eventHandlers: {[name: string]: Function};
    proxyMessenger: ProxyMessenger<DMessage, DMessage>;
    syncMessenger: SyncMessenger;
    messageFactory: MessageFactory;

    constructor(playerId: string) {
        this.player = new Player(playerId);
        this.player.disableControls = true;
        this.player.disableEvents = true;
        this.proxyMessenger = this.player.proxyMessenger;
        this.syncMessenger = this.player.syncMessenger;
        this.messageFactory = this.player.messageFactory;

        this.eventHandlers = {
            "OnlineSynchronizer:Player:<event>move": this.onRemoteMove.bind(this),
            "OnlineSynchronizer:Player:<event>shoot": this.onRemoteShoot.bind(this),
            "OnlineSynchronizer:Player:<event>rotate": this.onRemoteRotate.bind(this),
            "OnlineSynchronizer:Player:<event>die": this.onRemoteDie.bind(this),
            "OnlineSynchronizer:Player:<event>placeBlock": this.onRemotePlaceBlock.bind(this),
            "OnlineSynchronizer:Player:<event>jump": this.onRemoteJump.bind(this),
        };
    }
    
    /**
     * Initialize RemotePlayer service.
     */
    async initialize() {
        return this.player.initialize();
    }

    spawn(startingPosition: DVector3) {
        return this.player.spawn(startingPosition);
    }

    /**
     * When a controller direction event has been 
     * received, e.g. a joystick event.
     */
    async onRemoteMove(event: DirectionEvent) {
        // Invert the direction vector, since the remote player's 
        // orientation for controls is the opposite 
        // of the local player's.
        event.direction = {x: (-1) * event.direction.x, y: (-1) * event.direction.y};
        // Move the player's body in the controller's direction.
        await this.player.modifyWorld(
            [this.player.playerBodyId(), event],
            function(this: World3D, bodyId: string, event: DirectionEvent) {
                /* const body = this.getObject(bodyId) as PlayerBody;
                const jumpState = body.actionStateMachine.states["jump"] as JumpState;
                // We only want to force-update the state of the body 
                // if we are not currently jumping. Force-updating state 
                // during jumping often causes jumping to end prematurely.
                if (!jumpState.isActive) {
                    // Update the body's state in the world 
                    // to mirror the state the real player had at the time of the event.
                    body.setState(event.body);
                }
                const directionVector = new this.babylonjs.Vector2(event.direction.x, event.direction.y);
                body.move(directionVector); */
                // Return something because SyncMessenger 
                // requires that the receiving service returns a response.
                // ClassMessenger on the other hand only returns a 
                // response if the called function on the wrapped class returns something.
                // The World3D service class is wrapped in a ClassMessenger.
                // Thus, if we do not return anything here, we will not receive a response.
                return true;
            }
        )
    }

    /**
     * When the real player represented by the RemotePlayer has shot in their game.
     */
    onRemoteShoot(event: DirectionEvent) {
        // Update the player's state in the world 
        // to mirror the state the real player had at the time of the event.
        this.player.setState(event.body);
        // Now shoot in the direction given in the event.
        this.player.proxyMessenger.postMessage(
            this.player.messageFactory.createRequest("world3d", "modify", [
                {
                    boundArgs: [this.player.playerBodyId(), event.direction],
                    f: function(
                        this: World3D,
                        bodyId: string,
                        direction: DVector3
                    ) {
                        /* const body = this.getObject(bodyId) as PlayerBody;
                        const shootState = (body.actionStateMachine.states["shoot"] as ShootState);

                        if (!shootState.isActive) {
                            body.actionStateMachine.resourceStateMachine
                                .transferResourcesFromAll(
                                    "shoot", new Set<TStateResource>(Array.from(shootState.wantedResources))
                                );
                            
                            shootState.shoot(new this.babylonjs.Vector3(direction.x, direction.y, direction.z));
                        } */
                    }
                }
            ])
        );
    }

    /**
     * When the player body's state has changed and 
     * we simply wish to update it.
     */
    onSimpleStateChange(state: DPlayerBody) {
        this.player.setState(state);
    }

    /**
     * When the player has died in their game.
     */
    onRemoteDie() {
        // Tell the environment that the remote player has died.
        this.player.proxyMessenger.postMessage(
            this.player.messageFactory.createEvent("*", "Player:<event>die", [this.player.playerId])
        );
    }

    /**
     * When the remote player has rotated.
     */
    onRemoteRotate(angle: number) {
        this.player.setAngle(angle);
    }

    /**
     * When the remote player has placed a block.
     */
    onRemotePlaceBlock(absolutePosition: DVector3) {
        this.player.placeBlockAbsolute(absolutePosition);
    }

    /**
     * When the remote player has jumped.
     */
    async onRemoteJump() {
        this.player.disableControls = false;
        await this.player.onControllerKeyDown(" ", 0);
        this.player.disableControls = true;
    }
}