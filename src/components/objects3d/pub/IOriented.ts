import { Vector3 } from "@babylonjs/core";
import IObject from "./IObject";

/**
 * An object that has an orientation.
 */
export default interface IOriented extends IObject {
    /**
     * Direction vector pointing in the orientation direction.
     */
    direction: Vector3; 
}