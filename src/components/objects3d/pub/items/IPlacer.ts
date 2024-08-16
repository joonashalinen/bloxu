import { AbstractMesh } from "@babylonjs/core";
import Object from "../Object";

export default interface IPlacer {
    previewMesh: AbstractMesh;
    placeObject(object: Object): boolean;
}