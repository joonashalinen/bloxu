import IMovable from "./IMovable";
import DMovable from "./DMovable";
import { TransformNode, Vector3 } from "@babylonjs/core";
import { PhysicsAggregate } from "@babylonjs/core/Physics";
import IObject from "./IObject";
import EventEmitter from "../../events/pub/EventEmitter";
import IPhysical from "./IPhysical";

export default class Movable implements IObject, IMovable, DMovable, IPhysical {
    direction = new Vector3(0, 0, 0);
    transformNode: TransformNode;
    physicsAggregate: PhysicsAggregate;
    emitter = new EventEmitter();
    speed: number = 10;

    constructor(physicsAggregate: PhysicsAggregate) {
        this.transformNode = physicsAggregate.transformNode;
        this.physicsAggregate = physicsAggregate;
    }

    move(direction: Vector3, onlyInDirection: boolean = true): IMovable {
        if (!this.direction.equals(direction)) {
            if (onlyInDirection) {
                this.direction = direction;
            } else {
                this.direction = this.direction.add(direction).normalize();
            }
        }
        return this;
    }

    doOnTick(time: number): IObject {
        const mass = this.physicsAggregate.body.getMassProperties().mass;
        this.physicsAggregate.body.setLinearVelocity(this.direction.normalize().scale(mass! * this.speed));
        this.emitter.trigger("move");
        return this;
    }

}