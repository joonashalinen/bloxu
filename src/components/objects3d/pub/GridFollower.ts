import { TransformNode, Vector3 } from "@babylonjs/core";
import ITickable from "./ITickable";
import Grid from "./Grid";
import GridVector from "../../graphics3d/pub/GridVector";
import IObject from "./IObject";
import IFollower from "./IFollower";

/**
 * A Follower is an object that keeps itself at a set distance from another object. 
 * A GridFollower only updates its values to be according to a set cubic grid. 
 * Thus, a GridFollower will not follow the object smoothly but instead 
 * will snap to set grid points.
 */
export default class GridFollower implements IObject, ITickable, IFollower {
    constructor(
        public transformNode: TransformNode, 
        public trackedMesh: TransformNode,
        public cellSize: number,
        public offset: Vector3 = new Vector3(0, 0, 0)
    ) {
        
    }

    doOnTick(time: number): ITickable {
        return this.update();
    }

    /**
     * Update the follower mesh's position based on the followed mesh's position.
     */
    update() {
        this.transformNode.setAbsolutePosition(
            (new GridVector(this.trackedMesh.absolutePosition.add(this.offset), this.cellSize))
            .round()
        );
        return this;
    }
}