import EventEmitter from "../../../../components/events/pub/EventEmitter";
/**
 * A Player that is controlled remotely by another online player.
 */
export default class RemotePlayer {
    constructor() {
        this.emitter = new EventEmitter();
    }
}
//# sourceMappingURL=RemotePlayer.js.map