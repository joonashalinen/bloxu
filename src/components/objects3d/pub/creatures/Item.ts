import EventEmitter from "../../../events/pub/EventEmitter";
import IItem from "./IItem";

/**
 * Base class for IItem implementations.
 */
export default class Item implements IItem {
    hasSecondaryAction: boolean = false;
    emitter: EventEmitter = new EventEmitter();
    
    constructor() {
        
    }


    onItemUseEnded(callback: () => void): void {
        this.emitter.on("useEnd", callback);
    }

    offItemUseEnded(callback: () => void): void {
        this.emitter.off("useEnd", callback);
    }

    doMainAction(): void {
    }

    doSecondaryAction(): void {
    }
}