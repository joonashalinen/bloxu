import EventEmitter from "../../events/pub/EventEmitter";
import DVector2 from "../../graphics3d/pub/DVector2";
import IPointerController from "./IPointerController";

/**
 * IPointerController implementation for a mouse as detected 
 * via an HTMLElement's events.
 */
export default class MouseController implements IPointerController {
    emitter: EventEmitter = new EventEmitter();
    buttonMap = new Map<number, number>([[0, 0], [1, 2], [2, 1], [3, 3], [4, 4]]);

    constructor(element: HTMLElement) {
        element.addEventListener("mousemove", (event) => {
            this.emitter.trigger("point", [{x: event.clientX, y: event.clientY}]);
        });

        element.addEventListener("click", (event) => {
            this.emitter.trigger("trigger", [
                {x: event.clientX, y: event.clientY}, 
                this.buttonMap.get(event.button)
            ]);
        });
    }

    onPoint(callback: (position: DVector2) => void): IPointerController {
        this.emitter.on("point", callback);
        return this;
    }

    onTrigger(callback: (position: DVector2, buttonIndex: number) => void): IPointerController {
        this.emitter.on("trigger", callback);
        return this;
    }
}