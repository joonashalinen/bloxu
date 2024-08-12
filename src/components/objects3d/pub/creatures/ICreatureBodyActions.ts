import { Vector3 } from "@babylonjs/core";

export default interface ICreatureBodyActions {
    setPerpetualMotionDirection(direction: Vector3): void;
    jump(): void;
    doItemMainAction(): void;
    doItemSecondaryAction(): void;
    doOnTick(passedTime: number, absoluteTime: number): void;
}