import { AbstractMesh, Vector3 } from "@babylonjs/core";
import EventEmitter from "../../../events/pub/EventEmitter";
import Object from "../Object";
import Menu from "./Menu";
import GridVector from "../../../graphics3d/pub/GridVector";
import MeshGrid from "../../../graphics3d/pub/MeshGrid";
import Placer from "../items/Placer";
import { TMeshMapper } from "../items/ISelector";

/**
 * A menu that consists of a cubic grid 
 * of meshes that can be selected.
 */
export default class GridMenu extends Menu {
    emitter = new EventEmitter();
    pointedCell: Vector3;
    preview: TMeshMapper = this._defaultPreview.bind(this);
    unpreview: TMeshMapper = this._defaultUnpreview.bind(this);

    constructor(
        public grid: MeshGrid
    ) {
        super();
        this.preview = this._defaultPreview.bind(this);
        this.unpreview = this._defaultUnpreview.bind(this);
        
        this.transformNode = grid.transformNode;
        this.createFollowVector = () => (new GridVector(
            this.followedNode.getAbsolutePosition(), this.grid.cellSize)).round();
        grid.map(this.unpreview.bind(this));
    }

    doMainAction() {
        if (this.selectionPosition !== undefined) {
            this.emitter.trigger("select", [{
                absolutePosition: this.selectionPosition}]);
        }
        this.emitter.trigger("useEnd");
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
            this.preview(pickedMesh);
            this.pointedCell = cellCoordinates;
            this.selectionPosition = this.grid.meshes
                [this.pointedCell.x][this.pointedCell.y][this.pointedCell.z].absolutePosition.clone();
        }
    }

    /**
     * Stop pointing and highlighting the mesh that is currently being 
     * pointed at if such exists.
     */
    stopPointingAtMesh() {
        if (this.pointedCell !== undefined) {
            this.unpreview(
                this.grid.meshes[this.pointedCell.x][this.pointedCell.y][this.pointedCell.z]);
            this.pointedCell = undefined;
        }
    }

    /**
     * Sets the .prototypeMesh of .grid.
     */
    setGridPrototypeMesh(prototypeMesh: AbstractMesh) {
        this.grid.prototypeMesh = prototypeMesh;
        this.grid.map((mesh) => this.unpreview(mesh));
    }

    private _defaultPreview(mesh: AbstractMesh) {
        if (this.previewMesh !== undefined) {
            this.previewMesh.setAbsolutePosition(mesh.absolutePosition.clone());
            if (!this.previewMesh.isEnabled()) this.previewMesh.setEnabled(true);
        }
        return mesh;
    }

    private _defaultUnpreview(mesh: AbstractMesh) {
        if (this.previewMesh !== undefined) {
            this.previewMesh.setAbsolutePosition(mesh.absolutePosition.clone());
            if (this.previewMesh.isEnabled()) this.previewMesh.setEnabled(false);
        }
        return mesh;
    }
}