import { AnimationGroup, Vector3 } from "@babylonjs/core";
import EventEmitter from "../../../events/pub/EventEmitter";
import IMenu from "../menus/IMenu";

export default interface IItem {
    emitter: EventEmitter;
    hasSecondaryAction: boolean;
    aimedDirection: Vector3;
    useAnimation: AnimationGroup | undefined;
    useDelay: number;
    menu: IMenu;
    onItemUseEnded(callback: () => void): void;
    offItemUseEnded(callback: () => void): void;
    doMainAction(): void;
    doSecondaryAction(): void;
    doOnTick(passedTime: number, absoluteTime: number): void;
}