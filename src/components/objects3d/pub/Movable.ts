import IMovable from "./IMovable";
import DMovable from "./DMovable";
import { Vector3 } from "@babylonjs/core";
import { PhysicsAggregate } from "@babylonjs/core/Physics";
import IObject from "./IObject";
import EventEmitter from "../../events/pub/EventEmitter";

export default class Movable implements IObject, IMovable, DMovable {
    direction = new Vector3(0, 0, 0);
    nativeObj: PhysicsAggregate;
    emitter = new EventEmitter();
    speed: number = 10;

    constructor(nativeObj: PhysicsAggregate) {
        this.nativeObj = nativeObj;
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
        if (!this.direction.equals(new Vector3(0, 0, 0))) {
            const mass = this.nativeObj.body.getMassProperties().mass;
            this.nativeObj.body.setLinearVelocity(this.direction.normalize().scale(mass * this.speed));
            this.emitter.trigger("move");
        }
        return this;
    }

}