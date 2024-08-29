import EventEmitter from "../../events/pub/EventEmitter";
import DVector2 from "../../graphics3d/pub/DVector2";
import IPointerEmitter from "./IPointerEmitter";

/**
 * IPointerEmitter implementation for a mouse as detected 
 * via an HTMLElement's events.
 */
export default class MouseEmitter implements IPointerEmitter {
    emitter: EventEmitter = new EventEmitter();
    buttonMap = new Map<number, number>([[0, 0], [1, 2], [2, 1], [3, 3], [4, 4]]);
    lastMoveTriggerTime: number = 0;
    maxMovesPerSecond: number = 60;
    lastPointerPosition: DVector2;

    constructor(element: HTMLElement) {
        element.addEventListener("mousemove", (event) => {
            this.lastPointerPosition = {x: event.clientX, y: event.clientY};
            const timeNow = Date.now();
            if (timeNow - this.lastMoveTriggerTime > 1000 / this.maxMovesPerSecond) {
                this.emitter.trigger("point", [{x: event.clientX, y: event.clientY}]);
                this.lastMoveTriggerTime = timeNow;
            }
        });

        element.addEventListener("click", (event) => {
            if (this.lastPointerPosition !== undefined &&
                event.clientX !== this.lastPointerPosition.x && 
                event.clientY !== this.lastPointerPosition.y) {
                this.lastPointerPosition = {x: event.clientX, y: event.clientY};
                this.emitter.trigger("point", [this.lastPointerPosition]);
            }
            this.emitter.trigger("triggerPointer", [this.buttonMap.get(event.button)]);
        });
    }

    onPoint(callback: (position: DVector2) => void) {
        this.emitter.on("point", callback);
    }

    onTriggerPointer(callback: (buttonIndex: number) => void) {
        this.emitter.on("triggerPointer", callback);
    }
}