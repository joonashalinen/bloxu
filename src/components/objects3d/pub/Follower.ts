import { AbstractMesh, Mesh, TransformNode } from "@babylonjs/core";
import Movable from "./Movable";

/**
 * An object that follows a Movable, always 
 * keeping itself at the same position as the Movable.
 */
export default class Follower {
    constructor(public mesh: TransformNode, public movable: Movable) {
    }

    /**
     * Update the Follower's mesh position to 
     * match the position of the followed mesh.
     */
    doOnTick(time: number) {
        this.mesh.position = this.movable.nativeObj.transformNode.position.clone();
    }
}