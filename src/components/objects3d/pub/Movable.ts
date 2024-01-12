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
    movementVelocity: Vector3;
    lastPosition: Vector3;
    gravityEnabled: boolean = true;
    onlyUseForce: boolean = false;
    isInAir: boolean = false;

    constructor(
        public physicsAggregate: PhysicsAggregate
    ) {
        this.transformNode = physicsAggregate.transformNode;
        this.physicsAggregate = physicsAggregate;
        this.lastPosition = physicsAggregate.body.transformNode.position.clone();
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
            if (this.gravityEnabled) {
                this.updateIsInAir();
                if (this.isInAir || this.onlyUseForce) {
                    this.applyForce();
                } else {
                    this.updateVelocity();
                }
            } else {
                this.updateVelocity();
            }
        }
        return this;
    }

    /**
     * Whether the Movable is currently in air, either falling or rising.
     */
    updateIsInAir() {
        if (this.lastPosition !== undefined) {
            const yDifference = this.lastPosition.y - this.physicsAggregate.body.transformNode.position.y;
            this.isInAir = (yDifference > 0.00001 || yDifference < -0.00001);
        } else {
            this.isInAir = false;
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
     * Apply a force to the physics body, moving it.
     */
    applyForce() {
        const mass = this.physicsAggregate.body.getMassProperties().mass;
        const direction = this.direction.normalize().scale(mass! * this.speed * 1000);
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
            if (this.gravityEnabled) {
                this.updateIsInAir();
                if (this.isInAir) {
                    this.lastPosition = this.physicsAggregate.body.transformNode.position.clone();
                    this.applyForce();
                } else if (this.onlyUseForce) {
                    this.applyForce();
                } else {
                    this.updateVelocity();
                }
            } else {
                if (this.onlyUseForce) {
                    this.applyForce();
                } else {
                    this.updateVelocity();
                }
            }
        }
        return this;
    }
}