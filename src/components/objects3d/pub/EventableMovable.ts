import { TransformNode, Vector3 } from "@babylonjs/core";
import EventEmitter from "../../events/pub/EventEmitter";
import IEventable from "../../events/pub/IEventable";
import IMovable from "./IMovable";
import IObject from "./IObject";

/**
 * A movable object that triggers events 
 * upon moving or ending movement.
 */
export default class EventableMovable implements IMovable, IEventable, IObject {
    emitter: EventEmitter = new EventEmitter();
    
    public get direction(): Vector3 {
        return this.movable.direction;
    }
    public set direction(value: Vector3) {
        this.movable.direction = value;
    }

    get transformNode() {
        return this.movable.transformNode;
    }
    set setTransformNode(transformNode: TransformNode) {
        this.movable.transformNode = transformNode;
    }

    constructor(public movable: IMovable & IObject) {
        
    }

    move(direction: Vector3, onlyInDirection?: boolean | undefined): IMovable {
        this.movable.move(direction, onlyInDirection);
        if (direction.equals(new Vector3(0, 0, 0))) {
            this.emitter.trigger("moveEnd");
        } else {
            this.emitter.trigger("move", [direction]);
        }
        return this;
    }
}