import IMovable from "./IMovable";
import DMovable from "./DMovable";
import { Vector3 } from "@babylonjs/core";

export default class Movable implements IMovable, DMovable {
    direction = new Vector3(0, 0, 0);

    constructor() {
    }

    move(direction: Vector3, onlyInDirection?: boolean): IMovable {
        console.log("moved");
        return this;
    }

}