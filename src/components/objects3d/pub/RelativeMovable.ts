import { Axis, Quaternion, Vector3 } from "@babylonjs/core";
import IMovable from "./IMovable";
import IRotatable from "./IRotatable";

/**
 * A movable object that moves in relation to its 
 * current orientation.
 */
export default class RelativeMovable implements IMovable {
    constructor(public movable: IMovable, public rotatable: IRotatable) {
        
    }

    /**
     * Move in given direction relative to the current orientation.
     */
    move(direction: Vector3) {
        // Adjust the direction vector based on the current rotation angle.
        // We want movements to be relative to the orientation of the player character.
        const relativeDirection = direction.rotateByQuaternionToRef(
            Quaternion.RotationAxis(Axis.Y, this.rotatable.angle - Math.PI/2),
            new Vector3()
        );
        return this.movable.move(relativeDirection);
    }
}