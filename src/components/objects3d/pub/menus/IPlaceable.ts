import { Vector3 } from "@babylonjs/core";

export default interface IPlaceable {
    /**
     * Place an object at the given coordinate.
     */
    place(position: Vector3): void;
}