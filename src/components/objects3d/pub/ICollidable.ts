import { TransformNode } from "@babylonjs/core";

export default interface ICollidable {
    /**
     * When the ICollidable hits an object.
     */
    onCollide(callback: (mesh: TransformNode) => void): void;
}