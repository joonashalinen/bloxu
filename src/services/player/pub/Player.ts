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
    initialized: boolean;
    
    constructor() {
        this.emitter = new EventEmitter();
        this.eventHandlers = {
            "keyPress": this.onKeyPress.bind(this)
        };
        this.initialized = false;
    }

    /**
     * Does what Player wants to do when a key press event 
     * has been noticed.
     */
    onKeyPress(msg): Player {
        if (this.initialized) {
            this.emitter.trigger("message", [{
                recipient: "world3d",
                message: {
                    type: "request",
                    message: {
                        type: "modifyObject",
                        args: ["player1Body", function(this: World3D, obj: Movable) {
                            return obj.move(new this.babylonjs.Vector3(0, 0, 0))
                        }]
                    }
                }
            }]);
            return this;
        } else {
            return this;
        }
    }

    /**
     * Initialization procedure for the LocalPlayer service.
     */
    initialize(): Player {
        
        // ### Create Player character. ### 
        // We are currently just using a movable box 
        // until a proper player character has been developed.
        
        // Create box with physics.
        this.emitter.trigger("message", [{
            recipient: "world3d",
            message: {
                type: "request",
                message: {
                    type: "createCustomObject",
                    args: ["nativePlayer1Body", function(this: World3D) {
                        var box = this.babylonjs.MeshBuilder.CreateBox("nativePlayer1Body", {size: 0.7}, this.scene);
                        box.position.y = 4;
                        return new this.babylonjs.PhysicsAggregate(
                            box, 
                            this.babylonjs.PhysicsShapeType.BOX, 
                            { mass: 1 }, 
                            this.scene
                        );
                    }]
                }
            }
        }]);        

        // Make a movable box using the created box.
        this.emitter.trigger("message", [{
            recipient: "world3d",
            message: {
                type: "request",
                message: {
                    type: "createObject",
                    args: ["player1Body", "Movable", function(this: World3D) {
                        return [this.getObject("nativePlayer1Body")];
                    }]
                }
            }
        }]);

        this.initialized = true;

        return this;
    }
}