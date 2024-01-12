import { PhysicsAggregate, TransformNode, Vector3 } from "@babylonjs/core";
import IObject from "../IObject";
import IEventable from "../../../events/pub/IEventable";
import EventEmitter from "../../../events/pub/EventEmitter";
import Movable from "../Movable";

/**
 * A creature that can jump.
 */
export default class Jumpable implements IObject, IEventable {
    transformNode: TransformNode;
    jumpFactor: number = 7;
    jumping: boolean = false;
    jumpTimeoutInterval: number = 2000;
    emitter = new EventEmitter();
    startedJumping: boolean = false;

    constructor(
        public movable: Movable
    ) {
        this.transformNode = movable.transformNode;
    }

    /**
     * Jumps vertically.
     */
    jump() {
        if (!this.jumping) {
            this.movable.onlyUseForce = true;
            this.jumping = true;

            this.movable.physicsAggregate.body.applyImpulse(
                new Vector3(
                    0,
                    this.movable.physicsAggregate.body.getMassProperties().mass! * this.jumpFactor,
                    0
                ),
                this.movable.physicsAggregate.body.transformNode.absolutePosition
            );
        }
    }

    doOnTick(time: number) {
        if (this.movable.isInAir && !this.startedJumping) {
            this.startedJumping = true;
        }
        if (!this.movable.isInAir && this.startedJumping) {
            this.movable.onlyUseForce = false;
            this.jumping = false;
            this.startedJumping = false;
            this.emitter.trigger("jumpEnd");
        }
    }
}