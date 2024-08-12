import EventEmitter from "../../../events/pub/EventEmitter";

export default interface IItem {
    emitter: EventEmitter;
    hasSecondaryAction: boolean;
    onItemUseEnded(callback: () => void): void;
    offItemUseEnded(callback: () => void): void;
    doMainAction(): void;
    doSecondaryAction(): void;
}