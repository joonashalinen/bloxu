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
            console.log("jumping");
            this.jumping = true;

            this.movable.speed = this.movable.speed * 20;
            this.movable.onlyUseForce = true;
            this.movable.resetLastPosition();

            const maxVelocity = (new Vector3(1, 0, 0).scale(
                this.movable.physicsAggregate.body.getMassProperties().mass! * this.movable.speed
            )).length();
            this.movable.maxVelocity = maxVelocity / 20;

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
        // If jumping has started.
        if (this.movable.isInAir && !this.startedJumping) {
            this.startedJumping = true;
        }
        // If jumping has ended.
        if (!this.movable.isInAir && this.startedJumping) {
            this.movable.onlyUseForce = false;
            this.jumping = false;
            this.startedJumping = false;
            this.movable.speed = this.movable.speed / 20;
            this.movable.maxVelocity = undefined;
            this.emitter.trigger("jumpEnd");
        }
    }
}