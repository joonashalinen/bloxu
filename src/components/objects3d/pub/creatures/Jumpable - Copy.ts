import { PhysicsAggregate, TransformNode, Vector3 } from "@babylonjs/core";
import IObject from "../IObject";
import IEventable from "../../../events/pub/IEventable";
import EventEmitter from "../../../events/pub/EventEmitter";
import Movable from "../Movable";
import IMovable from "../IMovable";

/**
 * A creature that can jump.
 */
export default class Jumpable implements IObject, IEventable, IMovable {
    transformNode: TransformNode;
    jumpFactor: number = 200;
    jumpDecreaseFactor: number = 0.99;
    jumping: boolean = false;
    emitter = new EventEmitter();
    startedJumping: boolean = false;
    direction: Vector3 = new Vector3(0, 0, 0);
    upVector: Vector3 = new Vector3(0, 0, 0);

    constructor(
        public movable: IMovable & IObject
    ) {
        this.transformNode = movable.transformNode;
    }
    
    move(direction: Vector3, onlyInDirection?: boolean): IMovable {
        this.direction = direction;
        return this;
    }

    /**
     * Jumps vertically.
     */
    jump() {
        if (!this.jumping) {
            this.jumping = true;
            this.upVector = (new Vector3(0, 1, 0)).scale(this.jumpFactor);
            this.movable.move(new Vector3(0, 10000, 0));
        }
    }

    doOnTick(time: number) {
        if (this.jumping) {
            this.upVector = this.upVector.scale(this.jumpDecreaseFactor);
        }

        // If jumping has started.
        /* if (this.movable.isInAir && !this.startedJumping) {
            this.startedJumping = true;
        }
        // If jumping has ended.
        if (!this.movable.isInAir && this.startedJumping) {
            this.jumping = false;
            this.startedJumping = false;
            this.emitter.trigger("jumpEnd");
        } */
    }
}