import { Vector3 } from "@babylonjs/core";
import IPlaceable from "./IPlaceable";
import IEventable from "../../../events/pub/IEventable";
import EventEmitter from "../../../events/pub/EventEmitter";

/**
 * An IPlaceable implementation that triggers
 * events.
 */
export default class EventablePlaceable<T extends IPlaceable> implements IPlaceable, IEventable {
    emitter = new EventEmitter();

    constructor(public placeable: T) {
        
    }

    place(position: Vector3): EventablePlaceable<T> {
        this.placeable.place(position);
        this.emitter.trigger("place", [position]);
        return this;
    }    
}