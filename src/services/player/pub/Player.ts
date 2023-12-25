import EventEmitter from "../../../components/events/pub/EventEmitter";
import IPlayer from "./IPlayer";
import Movable from "../../../components/objects3d/pub/Movable";
import World3D from "../../world3d/pub/World3D";

/**
 * Class that contains the operations and state 
 * of the LocalPlayer service.
 */
export default class Player implements IPlayer {
    emitter: EventEmitter
    eventHandlers: {[name: string]: Function}
    
    constructor() {
        this.emitter = new EventEmitter();
        this.eventHandlers = {
            "keyPress": this.onKeyPress.bind(this)
        };
    }

    /**
     * Does what Player wants to do when a key press event 
     * has been noticed.
     */
    onKeyPress(msg): void {
        this.emitter.trigger("message", [{
            recipient: "world3d",
            message: {
                type: "request",
                message: {
                    type: "modifyObject",
                    args: ["movable1", function(this: World3D, obj: Movable) {
                        return obj.move(new this.babylonjs.Vector3(0, 0, 0))
                    }]
                }
            }
        }]);
    }
}