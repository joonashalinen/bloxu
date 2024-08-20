import Action from "../../computation/pub/Action";
import EventEmitter from "../../events/pub/EventEmitter";

/**
 * A history of actions performed.
 */
export default class History<T> {
    emitter: EventEmitter = new EventEmitter();
    actions: Action<T>[] = [];
    
    constructor() {
        
    }

    performAction(action: Action<T>) {
        action.perform();
        this.actions.push(action);
        this.emitter.trigger("performAction", [action]);
    }

    /**
     * Sets event listener for the 'performAction' event, which is triggered with 
     * the performed action as an argument whenever actions are performed.
     */
    onPerformAction(callback: (action: Action<T>) => void) {
        this.emitter.on("performAction", callback);
    }

    offPerformAction(callback: (action: Action<T>) => void) {
        this.emitter.off("performAction", callback);
    }
}