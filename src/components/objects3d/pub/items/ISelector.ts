import { Vector3 } from "@babylonjs/core";
import EventEmitter from "../../../events/pub/EventEmitter";
import IItem from "../creatures/IItem";
import Object from "../Object";

export interface DSelectInfo {
    object?: Object,
    gridCell?: Vector3
    absolutePosition: Vector3,
}

export default interface ISelector extends IItem {
    emitter: EventEmitter;
    isActive: boolean;
    activate(): void;
    deactivate(): void;
    // Listens to the 'select' event.
    onSelect(callback: (info: DSelectInfo) => void): void;
    onSelect(callback: (info: DSelectInfo) => void): void;
}