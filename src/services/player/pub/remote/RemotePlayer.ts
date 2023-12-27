import EventEmitter from "../../../../components/events/pub/EventEmitter";
import { DMessage } from "../../../../components/messaging/pub/DMessage";
import ProxyMessenger from "../../../../components/messaging/pub/ProxyMessenger";
import IPlayer from "../IPlayer";
import Player from "../local/Player";

/**
 * A Player that is controlled remotely by another online player.
 */
export default class RemotePlayer implements IPlayer {
    player = new Player("remote");
    eventHandlers: {[name: string]: Function};

    constructor() {
        this.player.startingPosition = {x: 0, y: 4, z: 20};
        this.eventHandlers = {};
    }
    
    /**
     * Initialize RemotePlayer service.
     */
    initialize() {
        this.player.initialize();
    }
}