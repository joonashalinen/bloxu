import { AnimationGroup } from "@babylonjs/core";
import Item from "../items/Item";
import ISelector, { DSelectInfo } from "./ISelector";

/**
 * Base class for ISelector implementations.
 */
export default class Selector extends Item implements ISelector {
    isActive: boolean = false;

    constructor(useAnimation?: AnimationGroup) {
        super(useAnimation);
    }
    
    activate(): void {
        this.isActive = true;
    }

    deactivate(): void {
        this.isActive = false;
    }

    onSelect(callback: (info: DSelectInfo) => void): void {
        this.emitter.on("select", callback);
    }

    offSelect(callback: (info: DSelectInfo) => void): void {
        this.emitter.off("select", callback);
    }
}