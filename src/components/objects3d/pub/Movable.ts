import IMovable from "./IMovable";
import DMovable from "./DMovable";
import { TransformNode, Vector3 } from "@babylonjs/core";
import { PhysicsAggregate } from "@babylonjs/core/Physics";
import IObject from "./IObject";
import IPhysical from "./IPhysical";
import ITickable from "./ITickable";

export default class Movable implements IObject, IMovable, DMovable, IPhysical, ITickable {
    direction = new Vector3(0, 0, 0);
    transformNode: TransformNode;
    speed: number = 10;
    gravity: Vector3 = new Vector3(0, -9.81, 0);
    movementVelocity: Vector3;
    lastPosition: Vector3;
    
    constructor(
        public physicsAggregate: PhysicsAggregate
    ) {
        this.transformNode = physicsAggregate.transformNode;
        this.physicsAggregate = physicsAggregate;
    }

    /**
     * Make the Movable keep itself in motion 
     * automatically without needing to call 
     * .doOnTick().
     */
    enableAutoUpdate() {
        this.physicsAggregate.transformNode.getScene()!.onBeforeRenderObservable.add(() => {
           this.doOnTick(0); 
        });
    }

    move(direction: Vector3, onlyInDirection: boolean = true): IMovable {
        if (this.direction.normalize().subtract(direction.normalize()).length() > 0.01) {
            if (onlyInDirection) {
                this.direction = direction;
            } else {
                this.direction = this.direction.add(direction).normalize();
            }
            if (!this.isFalling()) {
                this.updateVelocity();
            } else {
                this.applyForce();
            }
        }
        return this;
    }

    /**
     * Whether the Movable is currently moving downwards.
     */
    isFalling() {
        if (
            this.lastPosition !== undefined && 
            this.lastPosition.y - this.physicsAggregate.body.transformNode.position.y > 0.00001
        ) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Apply an impulse to the physics body, moving it.
     */
    applyImpulse() {
        const mass = this.physicsAggregate.body.getMassProperties().mass;
        const direction = this.direction.normalize().scale(mass! * this.speed * 1000);
        this.physicsAggregate.body.applyImpulse(
            direction, 
            this.physicsAggregate.body.transformNode.absolutePosition
        );
    }

    /**
     * Apply an impulse to the physics body, moving it.
     */
    applyForce() {
        const mass = this.physicsAggregate.body.getMassProperties().mass;
        const direction = this.direction.normalize().scale(mass! * this.speed * 5000);
        this.physicsAggregate.body.applyForce(
            direction, 
            this.physicsAggregate.body.transformNode.absolutePosition
        );
    }

    /**
     * Update the velocity of the physics body.
     */
    updateVelocity() {
        const mass = this.physicsAggregate.body.getMassProperties().mass;
        this.movementVelocity = this.direction.normalize().scale(mass! * this.speed);
        this.physicsAggregate.body.setLinearVelocity(this.movementVelocity);
    }

    doOnTick(time: number): Movable {
        if (!this.direction.equals(new Vector3(0, 0, 0))) {
            this.lastPosition = this.physicsAggregate.body.transformNode.position.clone();
            if (this.physicsAggregate.body.getLinearVelocity().length() < this.movementVelocity.length()) {
                this.applyForce();
            }
        }
        return this;
    }
}