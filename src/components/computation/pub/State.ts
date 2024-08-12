import EventEmitter from "../../events/pub/EventEmitter";
import IState from "./IState";

/**
 * Base implementation of a state of a StateMachine.
 */
export default class State implements IState {
    isActive: boolean = false;
    emitter: EventEmitter = new EventEmitter();

    constructor() {
        
    }

    start(...args: unknown[]): void {
        if (this.isActive) return;
        this.isActive = true;
    }

    end(): void {
        if (!this.isActive) return;
        this.isActive = false;
    }

    onEnd(callback: (nextStateId: string, ...args: unknown[]) => void): IState | void {
        this.emitter.on("end", callback);
    }

    /**
     * Ends the event and also triggers an "end" event
     * with the id of the next state to transition to.
     */
    endWithEvent(nextStateId: string, nextStateArgs: unknown[] = []) {
        if (!this.isActive) return;
        this.end();
        this.emitter.trigger("end", [nextStateId, ...nextStateArgs]);
    }
}