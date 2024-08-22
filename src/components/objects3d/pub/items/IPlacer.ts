import { AbstractMesh, Vector3 } from "@babylonjs/core";
import Object from "../Object";
import ObjectGrid from "../ObjectGrid";

export type TMeshMapper = (mesh: AbstractMesh) => AbstractMesh

export default interface IPlacer {
    heldObjects: Object[];
    maxHeldObjects: number;
    objectGrid: ObjectGrid;
    previewMesh: AbstractMesh;
    preview: TMeshMapper;
    unpreview: TMeshMapper;
    placementPosition: Vector3;
    canPlaceHeldObject(): boolean;
    placeHeldObject(): boolean;
    placeObject(object: Object): boolean;
    getObjectToPlace: () => Object;
    setPreviewMeshFromObject(object: Object): void;
}