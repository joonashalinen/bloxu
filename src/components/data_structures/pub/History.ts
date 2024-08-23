import Action from "../../computation/pub/Action";
import EventEmitter from "../../events/pub/EventEmitter";

/**
 * A history of actions performed.
 */
export default class History<T> {
    emitter: EventEmitter = new EventEmitter();
    undoableActions: Action<T>[] = [];
    redoableActions: Action<T>[] = [];

    constructor() {
        
    }

    perform(action: Action<T>) {
        action.perform();
        this.undoableActions.push(action);
        if (this.redoableActions.length > 0) {
            this.redoableActions.splice(0, this.redoableActions.length);
        }
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

    /**
     * Undoes the latest action.
     */
    undo() {
        if (this.undoableActions.length > 0) {
            const latestUndoable = this.undoableActions.pop();
            latestUndoable.undo();
            this.redoableActions.push(latestUndoable);
        }
    }

    /**
     * Redoes the latest undone action.
     */
    redo() {
        if (this.redoableActions.length > 0) {
            const latestRedoable = this.redoableActions.pop();
            latestRedoable.perform();
            this.undoableActions.push(latestRedoable);
        }
    }
}