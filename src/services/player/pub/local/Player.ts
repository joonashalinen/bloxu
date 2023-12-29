import EventEmitter from "../../../../components/events/pub/EventEmitter";
import IPlayer from "../IPlayer";
import Movable from "../../../../components/objects3d/pub/Movable";
import World3D from "../../../world3d/pub/World3D";
import { DMessage } from "../../../../components/messaging/pub/DMessage";
import ProxyMessenger from "../../../../components/messaging/pub/ProxyMessenger";
import DVector3 from "../../../../components/graphics3d/pub/DVector3";

/**
 * Class that contains the operations and state 
 * of the LocalPlayer service.
 */
export default class Player implements IPlayer {
    eventHandlers: {[name: string]: Function}
    initialized: boolean;
    proxyMessenger: ProxyMessenger<DMessage, DMessage>;
    startingPosition: DVector3;
    spawned: boolean;

    constructor(public playerId: string) {
        this.eventHandlers = {
            "controllerDirectionChange": this.onControllerDirectionChange.bind(this)
        };
        this.initialized = true; // The initialization procedure currently does nothing.
        this.spawned = false;
        this.proxyMessenger = new ProxyMessenger<DMessage, DMessage>();
        this.startingPosition = {x: 0, y: 4, z: 0};
    }

    /**
     * Id of the player body object in the world.
     */
    playerBodyId() {
        return "playerBody:" + this.playerId;
    }

    /**
     * Id of the library native object of the player body in the world. 
     * For BabylonJS this is the PhysicsAggregate object.
     */
    nativePlayerBodyId() {
        return "nativePlayerBody:" + this.playerId;
    }

    /**
     * Does what Player wants to do when the controller's 
     * direction control has changed (for example, the thumb joystick of WASD keys).
     */
    onControllerDirectionChange(event): Player {
        const direction = event.direction;
        // Reverse the controls for player 2, who is 
        // on the opposite side of the map.
        // A more general solution should be developed for this, 
        // but due to lack of time, this will have to suffice.
        if (this.playerId === "player-2") {
            direction.x = direction.x * (-1);
            direction.y = direction.y * (-1);
            direction.z = direction.z * (-1);
        }

        if (this.initialized && this.spawned) {
            this.proxyMessenger.postMessage({
                sender: this.playerId,
                recipient: "world3d",
                type: "request",
                message: {
                    type: "modifyObject",
                    args: [this.playerBodyId(), {
                        boundArgs: [event.direction],
                        f: function(this: World3D, direction: {x: number, y:number}, obj: Movable) {
                            return obj.move(new this.babylonjs.Vector3(direction.x, 0, direction.y * (-1)));
                        }
                    }]
                }
            });
            return this;
        } else {
            return this;
        }
    }

    /**
     * Initialization procedure for the LocalPlayer service.
     */
    initialize() {
        this.initialized = true;
        return true;
    }

    /**
     * Spawn the player at the given position.
     * We are currently just using a movable box 
     * until a proper player character has been developed.
     */
    spawn(startingPosition: DVector3): boolean {
        this.startingPosition = startingPosition;
        
        // Create box with physics.
        this.proxyMessenger.postMessage({
            sender: this.playerId,
            recipient: "world3d",
            type: "request",
            message: {
                type: "createCustomObject",
                args: [this.nativePlayerBodyId(), {
                    boundArgs: [this.nativePlayerBodyId(), this.startingPosition],
                    f: function(this: World3D, nativePlayerBodyId: string, startingPosition: DVector3) {
                        var box = this.babylonjs.MeshBuilder.CreateBox(nativePlayerBodyId, {size: 0.7}, this.scene);
                        
                        box.position.x = startingPosition.x;
                        box.position.y = startingPosition.y;
                        box.position.z = startingPosition.z;

                        return new this.babylonjs.PhysicsAggregate(
                            box, 
                            this.babylonjs.PhysicsShapeType.BOX, 
                            { mass: 0.1 }, 
                            this.scene
                        );
                    }
                }]
            }
        });        

        // Make a movable box using the created box.
        this.proxyMessenger.postMessage({
            sender: this.playerId,
            recipient: "world3d",
            type: "request",
            message: {
                type: "createObject",
                args: [this.playerBodyId(), "Movable", {
                    boundArgs: [this.nativePlayerBodyId()],
                    f: function(this: World3D, nativePlayerBodyId: string) {
                        return [this.getObject(nativePlayerBodyId)];
                    }
                }]
            }
        });

        this.spawned = true;

        return true;
    }
}