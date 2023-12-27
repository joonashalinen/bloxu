import EventEmitter from "../../../../components/events/pub/EventEmitter";
import IPlayer from "../IPlayer";

/**
 * A Player that is controlled remotely by another online player.
 */
export default class RemotePlayer implements IPlayer {
    emitter: EventEmitter
    
    constructor() {
        this.emitter = new EventEmitter();
    }

    
}