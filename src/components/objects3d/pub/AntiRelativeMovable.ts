import { Axis, Quaternion, TransformNode, Vector3 } from "@babylonjs/core";
import IMovable from "./IMovable";
import IRotatable from "./IRotatable";
import IObject from "./IObject";

/**
 * A normal RelativeMovable object transforms a movement vector 
 * to be relative to itself. AntiRelativeMovable transforms a movement vector 
 * by the opposite of this transformation. It is useful when nesting multiple 
 * IMovables, that wrap another IMovable. With AntiRelativeMovable we can control 
 * which of these nested Movables act on the absolute movement vectors 
 * and which on the relative movement vectors.
 */
export default class AntiRelativeMovable implements IMovable, IObject {
    transformNode: TransformNode;

    constructor(public movable: IMovable & IObject, public rotatable: IRotatable) {
        this.transformNode = movable.transformNode;
    }

    /**
     * Move in the direction rotated by the opposite amount of what 
     * RelativeMovable would rotate it.
     */
    move(direction: Vector3) {
        const relativeDirection = direction.rotateByQuaternionToRef(
            Quaternion.RotationAxis(Axis.Y, (-1) * this.rotatable.angle + Math.PI/2),
            new Vector3()
        );
        return this.movable.move(relativeDirection);
    }
}