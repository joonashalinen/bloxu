import { TransformNode } from "@babylonjs/core";
import { Vector3 } from "@babylonjs/core";
import IMovable from "./IMovable";
import IObject from "./IObject";

/**
 * An object with human-like shape and properties. 
 * For example, all humans (in general) can move, and the movements
 * have animations.
 */
export default class Humanoid implements IObject {
    constructor(public transformNode: TransformNode) {
        
    }
    
    move(direction: Vector3, onlyInDirection?: boolean | undefined): IObject {
        throw new Error("Method not implemented.");
    }
}