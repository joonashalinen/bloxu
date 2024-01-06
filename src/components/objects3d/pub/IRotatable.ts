import { Vector2 } from "@babylonjs/core";

export default interface IRotatable {
    direction: Vector2;
    angle: number;
    setAngle(angle: number): IRotatable;
}