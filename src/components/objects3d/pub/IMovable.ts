import { Vector3 } from "@babylonjs/core";

/**
 * An object that can be told to constantly move in different 
 * directions at a given speed.
 */
export default interface IMovable {
    
    /**
     * Sets the object to move in the given direction. The magnitude 
     * of the vector indicates the speed. The onlyInDirection property 
     * tells us if we wish to replace all previous movement with this 
     * direction vector.
     */
    move(direction: Vector3, onlyInDirection?: boolean): IMovable;

}