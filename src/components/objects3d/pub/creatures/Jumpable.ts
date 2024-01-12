import { PhysicsAggregate, TransformNode, Vector3 } from "@babylonjs/core";
import IObject from "../IObject";
import IEventable from "../../../events/pub/IEventable";
import EventEmitter from "../../../events/pub/EventEmitter";

/**
 * A creature that can jump.
 */
export default class Jumpable implements IObject, IEventable {
    transformNode: TransformNode;
    jumpFactor: number = 8;
    jumping: boolean = false;
    jumpTimeoutInterval: number = 2000;
    emitter = new EventEmitter();

    constructor(public physicsAggregate: PhysicsAggregate) {
        this.transformNode = physicsAggregate.body.transformNode;
    }

    /**
     * Jumps vertically.
     */
    jump() {
        if (!this.jumping) {
            this.physicsAggregate.body.applyImpulse(
                new Vector3(
                    0,
                    this.physicsAggregate.body.getMassProperties().mass! * this.jumpFactor,
                    0
                ),
                this.physicsAggregate.body.transformNode.absolutePosition
            );
            this.jumping = true;

            setTimeout(() => {
                this.jumping = false;
                this.emitter.trigger("jumpEnd");
            }, this.jumpTimeoutInterval);
        }
    }
}