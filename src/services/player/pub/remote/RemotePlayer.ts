import EventEmitter from "../../../../components/events/pub/EventEmitter";
import DVector3 from "../../../../components/graphics3d/pub/DVector3";
import { DMessage } from "../../../../components/messaging/pub/DMessage";
import ProxyMessenger from "../../../../components/messaging/pub/ProxyMessenger";
import IPlayer from "../IPlayer";
import Player from "../local/Player";

/**
 * A Player that is controlled remotely by another online player.
 */
export default class RemotePlayer implements IPlayer {
    player: Player;
    eventHandlers: {[name: string]: Function};

    constructor(playerId: string) {
        this.player = new Player(playerId);
        this.player.startingPosition = {x: 0, y: 4, z: 20};
        this.eventHandlers = {
            "remoteControllerDirectionChange": this.onRemoteControllerDirectionChange.bind(this)
        };
    }
    
    /**
     * Initialize RemotePlayer service.
     */
    initialize() {
        this.player.initialize();
    }

    spawn(startingPosition: DVector3) {
        return this.player.spawn(startingPosition);
    }

    /**
     * When a controller direction event has been 
     * received, e.g. a joystick event.
     */
    onRemoteControllerDirectionChange(event) {
        this.player.onControllerDirectionChange(event);
    }
}