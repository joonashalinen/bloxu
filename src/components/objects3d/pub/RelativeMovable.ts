import { Axis, Quaternion, TransformNode, Vector3 } from "@babylonjs/core";
import IMovable from "./IMovable";
import IRotatable from "./IRotatable";
import IObject from "./IObject";

/**
 * A movable object that moves in relation to its 
 * current orientation.
 */
export default class RelativeMovable implements IMovable, IObject {
    transformNode: TransformNode;
    direction: Vector3;

    constructor(public movable: IMovable & IObject, public rotatable: IRotatable) {
        this.transformNode = movable.transformNode;
    }

    /**
     * Move in given direction relative to the current orientation.
     */
    move(direction: Vector3) {
        this.direction = direction;
        // Adjust the direction vector based on the current rotation angle.
        // We want movements to be relative to the orientation of the player character.
        const relativeDirection = direction.rotateByQuaternionToRef(
            Quaternion.RotationAxis(Axis.Y, this.rotatable.angle - Math.PI/2),
            new Vector3()
        );
        return this.movable.move(relativeDirection);
    }
}