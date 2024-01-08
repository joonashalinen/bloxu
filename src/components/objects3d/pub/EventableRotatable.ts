import { Vector2 } from "@babylonjs/core";
import EventEmitter from "../../events/pub/EventEmitter";
import IEventable from "../../events/pub/IEventable";
import IRotatable from "./IRotatable";

/**
 * Add events to an IRotatable
 */
export default class EventableRotatable<TRotatable extends IRotatable> implements IRotatable, IEventable {
    emitter: EventEmitter = new EventEmitter();
    endTurnTimeout: unknown;

    get angle() {
        return this.rotatable.angle;
    }
    get direction() {
        return this.rotatable.direction;
    }
    set setDirection(direction: Vector2) {
        this.rotatable.direction = direction;
    }

    constructor(public rotatable: TRotatable) {
        
    }

    setAngle(angle: number): IRotatable {
        // Clear timeout meant to end turning once 
        // no turning is happening anymore. We want to reset 
        // the timeout, since because we are here, then 
        // turning is clearly still happening.
        if (this.endTurnTimeout !== undefined) {
            clearTimeout(this.endTurnTimeout as number);
        }

        // Timeout that successfully goes once there has been no
        // turning for 0.1 seconds.
        this.endTurnTimeout = setTimeout(() => {
            this.emitter.trigger("rotateEnd");
        }, 100);

        this.rotatable.setAngle(angle);
        return this;
    }
}