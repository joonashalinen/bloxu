import { AbstractMesh, Vector3 } from "@babylonjs/core";
import Object from "../Object";
import ObjectGrid from "../ObjectGrid";
import IItem from "./IItem";
import { DSelectInfo } from "./ISelector";

export interface DPlacementInfo extends DSelectInfo {
    objectWasHeld: boolean;
}

export default interface IPlacer {
    heldObjects: Object[];
    maxHeldObjects: number;
    objectGrid: ObjectGrid;
    canPlaceHeldObject(): boolean;
    placeHeldObject(): boolean;
    placeObject(object: Object): boolean;
    getObjectToPlace: () => Object;
    setPreviewMeshFromObject(object: Object): void;
    onPlace(callback: (info: DPlacementInfo) => void): void;
    offPlace(callback: (info: DPlacementInfo) => void): void;
}