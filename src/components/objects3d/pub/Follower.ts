import { TransformNode } from "@babylonjs/core";
import ITickable from "./ITickable";
import IEventable from "../../events/pub/IEventable";
import IMovable from "./IMovable";

/**
 * An object that follows a Movable, always 
 * keeping itself at the same position as the Movable.
 */
export default class Follower implements ITickable {
    constructor(
        public mesh: TransformNode, 
        public trackedMesh: TransformNode,
        public movable: IMovable & IEventable
        ) {
    }

    /**
     * Make the object update its position automatically 
     * whenever the movable moves.
     */
    enableAutoUpdate() {
        this.movable.emitter.on("move", () => {
            this.update();
        });
    }

    /**
     * Make the object's position match the 
     * position of the tracked object.
     */
    update() {
        this.mesh.position = this.trackedMesh.position.clone();
    }

    /**
     * Update the Follower's mesh position to 
     * match the position of the followed mesh.
     */
    doOnTick(time: number) {
        this.update();
        return this;
    }
}