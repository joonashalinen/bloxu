import DVector3 from "../../../../components/graphics3d/pub/DVector3";
import PlayerBody from "../../../world3d/conf/custom_object_types/PlayerBody";
import World3D from "../../../world3d/pub/World3D";
import IPlayer from "../IPlayer";
import Player, { DirectionEvent } from "../local/Player";
import DVector2 from "../../../../components/graphics3d/pub/DVector2";
import DPlayerBody from "../../../world3d/conf/custom_object_types/DPlayerBody";

/**
 * A Player that is controlled remotely by another online player.
 */
export default class RemotePlayer implements IPlayer {
    player: Player;
    eventHandlers: {[name: string]: Function};

    constructor(playerId: string) {
        this.player = new Player(playerId);
        this.player.disableControls = true;
        this.eventHandlers = {
            "OnlineSynchronizer:Player:<event>move": this.onRemoteMove.bind(this),
            "OnlineSynchronizer:Player:<event>shoot": this.onRemoteShoot.bind(this),
            "OnlineSynchronizer:Player:<event>rotate": this.onRemoteRotate.bind(this),
            "OnlineSynchronizer:Player:<event>die": this.onRemoteDie.bind(this),
            "OnlineSynchronizer:Player:<event>placeBlock": this.onRemotePlaceBlock.bind(this),
        };
    }
    
    /**
     * Initialize RemotePlayer service.
     */
    initialize() {
        return this.player.initialize();
    }

    spawn(startingPosition: DVector3) {
        return this.player.spawn(startingPosition);
    }

    /**
     * When a controller direction event has been 
     * received, e.g. a joystick event.
     */
    onRemoteMove(event: DirectionEvent) {
        // Invert the direction vector, since the remote player's 
        // orientation for controls is the opposite 
        // of the local player's.
        event.direction = {x: (-1) * event.direction.x, y: (-1) * event.direction.y};
        // Update the player's state in the world 
        // to mirror the state the real player had at the time of the event.
        this.player.setState(event.body);
        // Enable controls temporarily so that we can simulate a controller direction event.
        // happening to the Player.
        this.player.disableControls = false;
        this.player.onControllerDirectionChange(event.direction, 0);
        this.player.disableControls = true;
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
                        direction: DVector2
                    ) {
                        const body = this.getObject(bodyId) as PlayerBody;
                        body.shoot(new this.babylonjs.Vector2(direction.x, direction.y));
                    }
                }
            ])
        )
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
        console.log(absolutePosition);
        this.player.placeBlockAbsolute(absolutePosition);
    }
}