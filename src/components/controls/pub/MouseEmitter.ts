import EventEmitter from "../../events/pub/EventEmitter";
import DVector2 from "../../graphics3d/pub/DVector2";
import IPointerEmitter from "./IPointerEmitter";

/**
 * IPointerEmitter implementation for a mouse as detected 
 * via an HTMLElement's events.
 */
export default class MouseController implements IPointerEmitter {
    emitter: EventEmitter = new EventEmitter();
    buttonMap = new Map<number, number>([[0, 0], [1, 2], [2, 1], [3, 3], [4, 4]]);
    lastMoveTriggerTime: number = 0;
    maxMovesPerSecond: number = 60;

    constructor(element: HTMLElement) {
        element.addEventListener("mousemove", (event) => {
            const timeNow = Date.now();
            if (timeNow - this.lastMoveTriggerTime > 1000 / this.maxMovesPerSecond) {
                this.emitter.trigger("point", [{x: event.clientX, y: event.clientY}]);
                this.lastMoveTriggerTime = timeNow;
            }
        });

        element.addEventListener("click", (event) => {
            this.emitter.trigger("trigger", [
                {x: event.clientX, y: event.clientY}, 
                this.buttonMap.get(event.button)
            ]);
        });
    }

    onPoint(callback: (position: DVector2) => void): IPointerEmitter {
        this.emitter.on("point", callback);
        return this;
    }

    onTrigger(callback: (position: DVector2, buttonIndex: number) => void): IPointerEmitter {
        this.emitter.on("trigger", callback);
        return this;
    }
}