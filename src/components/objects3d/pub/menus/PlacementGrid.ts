import { Vector3 } from "@babylonjs/core";
import IObject from "../IObject";
import MeshGrid from "../MeshGrid";
import IPlaceable from "./IPlaceable";

/**
 * A cubic grid for placing objects in.
 */
export default class PlacementGrid implements IPlaceable {
    setPosition: (obj: IObject, position: Vector3) => void = (obj, position) => {
        obj.transformNode.setAbsolutePosition(position);
    }

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
        this.setPosition(object, absolutePosition);
        return this;
    }
}