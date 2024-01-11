import { TransformNode, Vector3 } from "@babylonjs/core";

export default interface IFollower {
    trackedMesh: TransformNode;
    offset: Vector3;
    update(): IFollower;
}