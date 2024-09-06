import { TransformNode, Vector2 } from "@babylonjs/core";

export default interface IMenu {
    transformNode: TransformNode;
    followedNode: TransformNode;
    follow(other: TransformNode): void;
    doOnTick(passedTime: number, absoluteTime: number): void;
    point(position: Vector2): void;
    destroy(): void;
}