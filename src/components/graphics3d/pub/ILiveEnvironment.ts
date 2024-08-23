import { TransformNode } from "@babylonjs/core";

export default interface ILiveEnvironment {
    generate(): void;
    destroy(): void;
    doOnTick(passedTime: number, absoluteTime: number): void;
}