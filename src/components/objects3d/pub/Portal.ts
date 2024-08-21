import { AbstractMesh, IPhysicsCollisionEvent } from "@babylonjs/core";
import Device from "./Device";
import Physical from "./Physical";
import Object from "./Object";

/**
 * A portal is a device that can teleport 
 * other objects.
 */
export default class Portal extends Device {

    constructor(wrappee: AbstractMesh | Physical) {
        super(wrappee);
    }
    
    /**
     * Teleports the colliding object to the void.
     */
    handleObjectCollision(object: Object) {
        object.teleportToVoid();
    }
}