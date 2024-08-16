import { AbstractMesh, MeshBuilder, TransformNode, Vector2 } from "@babylonjs/core";
import Grid from "../Grid";
import { IPointable } from "../../../graphics2d/pub/IPointable";
import PlacementGrid from "./PlacementGrid";
import Object from "../Object";
import IPlaceable from "./IPlaceable";

/**
 * Adds the functionality of allowing placement via a pointer controller 
 * (such as a mouse pointer for example) place objects in a PlacementGrid;
 */
export default class PointablePlacementGrid<T extends IPlaceable> implements IPointable {
    highlightMesh: (mesh: AbstractMesh) => AbstractMesh = (mesh) => {mesh.visibility = 1; return mesh;};
    unhighlightMesh: (mesh: AbstractMesh) => AbstractMesh = (mesh) => {mesh.visibility = 0.5; return mesh;};
    pointedMesh: AbstractMesh | undefined;

    constructor(
        public grid: Grid,
        public placementGrid: T
    ) {
        grid.map((mesh) => this.unhighlightMesh(mesh));
    }

    /**
     * Point at a pointer position. If the pointer is pointing at a cell on 
     * the PlacementGrid, then that cell will be highlighted.
     */
    point(pointerPosition: {x: number, y: number}) {
        const pickInfo = this.grid.transformNode.getScene()!.pick(pointerPosition.x, pointerPosition.y, (mesh) => {
            return this.grid.meshIsInGrid(mesh);
        });
        this.stopPointingAtMesh();
        if (pickInfo.hit) {
            const pickedMesh = pickInfo.pickedMesh!;
            this.highlightMesh(pickedMesh);
            this.pointedMesh = pickedMesh;
        }
        return this;
    }

    /**
     * Place a mesh at the currently pointed position on the grid 
     * if a valid grid position is being pointed at.
     */
    place() {
        if (this.pointedMesh !== undefined) {
            this.placementGrid.place(this.grid.meshCellCoordinates(this.pointedMesh));
        }
        return this;
    }

    /**
     * Stop pointing and highlighting the mesh that is currently being 
     * pointed at if such exists.
     */
    stopPointingAtMesh() {
        if (this.pointedMesh !== undefined) {
            this.unhighlightMesh(this.pointedMesh);
            this.pointedMesh = undefined;
        }
    }
}