import { Vector3 } from "@babylonjs/core";
import IToggleable from "../../misc/pub/IToggleable";
import IMovable from "./IMovable";
import IEventable from "../../events/pub/IEventable";
import EventEmitter from "../../events/pub/EventEmitter";

/**
 * A movable object for which movements can be toggled on or off.
 */
export default class ToggleableMovable implements IMovable, IToggleable, IEventable {
    isEnabled = true;
    emitter = new EventEmitter();

    constructor(public movable: IMovable | (IMovable & IEventable)) {
        if ("emitter" in movable) {
            movable.emitter.on("moveEnd", () => {
                if (this.isEnabled) {
                    this.emitter.trigger("moveEnd", []);
                }
            });
            movable.emitter.on("move", () => {
                if (this.isEnabled) {
                    this.emitter.trigger("move", []);
                }
            });
        }
    }

    move(direction: Vector3, onlyInDirection?: boolean | undefined): IMovable {
        if (this.isEnabled) {
            this.movable.move(direction, onlyInDirection);
        }
        return this;
    }

    enable(): IToggleable {
        this.isEnabled = true;
        return this;
    }

    disable(): IToggleable {
        this.isEnabled = false;
        this.movable.move(new Vector3(0, 0, 0));
        return this;
    }
}