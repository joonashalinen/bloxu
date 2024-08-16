import { AbstractMesh, TransformNode, Vector3 } from "@babylonjs/core";
import EventEmitter from "../../../events/pub/EventEmitter";
import Object from "../Object";
import Grid, { TGridMapper } from "../Grid";
import Menu from "./Menu";
import GridVector from "../../../graphics3d/pub/GridVector";
import IPlacer from "../items/IPlacer";

/**
 * A menu that consists of a cubic grid 
 * of meshes that can be selected.
 */
export default class GridMenu extends Menu implements IPlacer {
    emitter = new EventEmitter();
    previewMesh: AbstractMesh;
    preview: TGridMapper =  this._defaultPreview.bind(this);
    unpreview: TGridMapper = this._defaultUnpreview.bind(this);
    getObjectToPlace: () => Object;
    pointedCell: Vector3;

    constructor(
        public grid: Grid
    ) {
        super();
        this.transformNode = grid.transformNode;
        this.grid.baseOffset.addInPlace(
            new Vector3(-grid.width()/2 + grid.cellSize/2, 0, -grid.depth() / 2 + grid.cellSize/2));
        this.createFollowVector = () => (new GridVector(
            this.followedNode.absolutePosition, this.grid.cellSize, this.grid.totalOffset())).round();
        grid.map(this.unpreview.bind(this));
    }

    doMainAction() {
        if (this.getObjectToPlace !== undefined && this.pointedCell !== undefined) {
            this.placeObject(this.getObjectToPlace());
        } else {
            this.emitter.trigger("useEnd");
        }
    }

    /**
     * Place an object at the given grid cell coordinates.
     * or at the pointed mesh if such exists. Returns a boolean 
     * indicating whether the object was placed or not.
     */
    placeObject(object: Object) {
        if (this.pointedCell === undefined) {
            this.emitter.trigger("useEnd");
            return false;
        }

        const absolutePosition = this.grid.meshes
            [this.pointedCell.x][this.pointedCell.y][this.pointedCell.z].absolutePosition;
        object.transformNode.setAbsolutePosition(absolutePosition);
        if (object.isInVoid) object.bringBackFromTheVoid();
        this.emitter.trigger("select", [{
            object: object,
            absolutePosition: object.transformNode.absolutePosition.clone(),
            gridCell: this.pointedCell}]);
        this.emitter.trigger("useEnd");

        return true;
    }

    /**
     * Point at a pointer position. If the pointer is pointing at a cell on 
     * the Grid, then that cell will be highlighted.
     */
    point(pointerPosition: {x: number, y: number}) {
        const pickInfo = this.grid.transformNode.getScene()!.pick(pointerPosition.x, pointerPosition.y, (mesh) => {
            return this.grid.meshIsInGrid(mesh);
        });
        this.stopPointingAtMesh();
        if (pickInfo.hit) {
            const pickedMesh = pickInfo.pickedMesh!;
            const cellCoordinates = this.grid.meshCellCoordinates(pickedMesh);
            this.preview(pickedMesh, cellCoordinates);
            this.pointedCell = cellCoordinates;
        }
    }

    /**
     * Stop pointing and highlighting the mesh that is currently being 
     * pointed at if such exists.
     */
    stopPointingAtMesh() {
        if (this.pointedCell !== undefined) {
            this.unpreview(
                this.grid.meshes[this.pointedCell.x][this.pointedCell.y][this.pointedCell.z],
                this.pointedCell);
            this.pointedCell = undefined;
        }
    }

    /**
     * Sets the .prototypeMesh of .grid.
     */
    setGridPrototypeMesh(prototypeMesh: AbstractMesh) {
        this.grid.prototypeMesh = prototypeMesh;
        this.grid.map((mesh, celIIndex) => this.unpreview(mesh, celIIndex));
    }

    private _defaultPreview(mesh: AbstractMesh) {
        if (this.previewMesh !== undefined) {
            if (mesh.name.includes("Grid:Prototype")) {
                this.previewMesh.setAbsolutePosition((mesh.parent as AbstractMesh).absolutePosition.clone());
            } else {
                this.previewMesh.setAbsolutePosition(mesh.absolutePosition.clone());
            }
            if (!this.previewMesh.isEnabled()) this.previewMesh.setEnabled(true);
        } else {
            if (mesh.name.includes("?Grid:Wrapper") && !mesh.name.includes("Grid:Prototype")) {
                mesh.getChildMeshes().at(0).visibility = 1;
            } else {
                mesh.visibility = 1;
            }
        }
        return mesh;
    }

    private _defaultUnpreview(mesh: AbstractMesh) {
        if (this.previewMesh !== undefined) {
            if (this.previewMesh.isEnabled()) this.previewMesh.setEnabled(false);
        } else {
            if (mesh.name.includes("?Grid:Wrapper") && !mesh.name.includes("Grid:Prototype")) {
                mesh.getChildMeshes().at(0).visibility = 0.5;
            } else {
                mesh.visibility = 0.5;
            }
        }
        return mesh;
    }
}