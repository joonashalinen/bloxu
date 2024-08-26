import { AnimationGroup, TransformNode, Vector3 } from "@babylonjs/core";
import EventEmitter from "../../../events/pub/EventEmitter";
import IMenu from "../menus/IMenu";
import Object from "../Object";
import History from "../../../data_structures/pub/History";

export default interface IItem<Target, Context> {
    ownerId: string
    isActive: boolean;
    emitter: EventEmitter;
    history: History<Target, Context>;
    hasSecondaryAction: boolean;
    aimedDirection: Vector3;
    useAnimation: AnimationGroup | undefined;
    useDelay: number;
    menu: IMenu;
    activate(): void;
    deactivate(): void;
    get transformNode(): TransformNode;
    set transformNode(transformNode: TransformNode);
    onItemUseEnded(callback: () => void): void;
    offItemUseEnded(callback: () => void): void;
    doMainAction(): void;
    doSecondaryAction(): void;
    undo(): void;
    redo(): void;
    doOnTick(passedTime: number, absoluteTime: number): void;
}