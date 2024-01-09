import { Vector3 } from "@babylonjs/core";
import IObject from "../IObject";
import MeshGrid from "../MeshGrid";

/**
 * A cubic grid for placing objects in.
 */
export default class PlacementGrid {
    constructor(
        public grid: MeshGrid,
        public createObject: () => IObject
    ) {
        
    }
    
    /**
     * Place an object at the given grid cell coordinates.
     */
    place(cell: Vector3) {
        const absolutePosition = this.grid.meshes[cell.x][cell.y][cell.z].absolutePosition;
        const object = this.createObject();
        object.transformNode.setAbsolutePosition(absolutePosition);
    }
}