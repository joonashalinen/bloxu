import EventEmitter from "../../../components/events/pub/EventEmitter";
import World3D from "../../world3d/pub/World3D";
import * as babylonjs from "@babylonjs/core";

/**
 * Class that contains the operations and state 
 * of the LocalGameMaster service.
 */
export default class GameMaster {
    emitter: EventEmitter
    eventHandlers: {[name: string]: Function}
    initialized: boolean;
    
    constructor() {
        this.emitter = new EventEmitter();
        this.eventHandlers = {};
        this.initialized = false;
    }

    /**
     * Initialization procedure for the LocalGameMaster service.
     */
    initialize(): GameMaster {
        
        // ### Create initial cube islands the players will stand on. ### 
        
        // Register the constructor for a standard floating cube island.
        this.emitter.trigger("message", [{
            recipient: "world3d",
            message: {
                type: "request",
                message: {
                    type: "registerObjectType",
                    args: ["GameMaster.CubeIsland", function(this: World3D, position: babylonjs.Vector3) {
                        var box = this.babylonjs.MeshBuilder.CreateBox("nativePlayer1Body", {size: 3}, this.scene);
                        return new this.babylonjs.PhysicsAggregate(
                            box, 
                            this.babylonjs.PhysicsShapeType.BOX, 
                            { mass: 0 }, 
                            this.scene
                        );
                    }]
                }
            }
        }]);

        // Create a cube island. Currently we only have one island at the center.
        this.emitter.trigger("message", [{
            recipient: "world3d",
            message: {
                type: "request",
                message: {
                    type: "createObject",
                    args: ["cubeIsland1", "GameMaster.CubeIsland", function(this: World3D) {
                        return [new this.babylonjs.Vector3(0, 0, 0)];
                    }]
                }
            }
        }]);

        this.initialized = true;

        return this;
    }
}