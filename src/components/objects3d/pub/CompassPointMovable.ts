import { Axis, Quaternion, Vector3 } from "@babylonjs/core";
import TCompassPoint from "../../geometry/pub/TCompassPoint";
import CompassPointVector from "../../graphics3d/pub/CompassPointVector";
import IMovable from "./IMovable";

/**
 * A movable object that can be moved in one of 8 compass point directions.
 */
export default class CompassPointMovable {
    constructor(public movable: IMovable) {
        
    }

    /**
     * Move in given compass point direction.
     */
    move(direction: TCompassPoint) {
        // Transform compass direction into vector.
        const directionVector = (new CompassPointVector(direction)).vector;
        // Transform to 3D vector.
        const direction3D = new Vector3(directionVector.x, 0, directionVector.y);
        // Move.
        this.movable.move(direction3D);
    }
}