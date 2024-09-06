import { AbstractMesh, IPhysicsCollisionEvent, Vector3 } from "@babylonjs/core";
import Device from "./Device";
import Physical from "./Physical";
import Object from "./Object";

/**
 * A portal is a device that can teleport 
 * other objects.
 */
export default class Portal extends Device {
    heldObjects: Set<Object> = new Set();
    spawnOffset: Vector3 = new Vector3(0, 0, 0);
    
    constructor(wrappee: AbstractMesh | Physical) {
        super(wrappee);
    }
    
    /**
     * Teleports the colliding object to the void.
     */
    handleObjectCollision(object: Object) {
        if (!this.heldObjects.has(object)) {
            object.teleportToVoid();
            this.heldObjects.add(object);
        }
    }

    /**
     * Returns the object back from the void
     * if it is an object that has been teleported there by the Portal.
     */
    unteleport(object: Object) {
        if (this.heldObjects.has(object)) {
            object.transformNode.setAbsolutePosition(
                this.transformNode.getAbsolutePosition().add(this.spawnOffset));
            object.bringBackFromTheVoid();
            this.heldObjects.delete(object);
        }
    }
}