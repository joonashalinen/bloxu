import { AbstractMesh, TransformNode, Vector3 } from "@babylonjs/core";
import EventEmitter from "../../../events/pub/EventEmitter";
import Object from "../Object";
import Menu from "./Menu";
import GridVector from "../../../graphics3d/pub/GridVector";
import IPlacer, { TMeshMapper } from "../items/IPlacer";
import ObjectGrid from "../ObjectGrid";
import MeshGrid from "../../../graphics3d/pub/MeshGrid";
import Placer from "../items/Placer";
import { DSelectInfo } from "../items/ISelector";

/**
 * A menu that consists of a cubic grid 
 * of meshes that can be selected.
 */
export default class GridMenu extends Menu implements IPlacer {
    emitter = new EventEmitter();
    pointedCell: Vector3;

    public get preview() {return this.asPlacer.preview;}
    public set preview(previewer) {this.asPlacer.preview = previewer;}

    public get unpreview() {return this.asPlacer.unpreview;}
    public set unpreview(unpreviewer) {this.asPlacer.unpreview = unpreviewer;}

    public get previewMesh() {return this.asPlacer.previewMesh;}
    public set previewMesh(previewMesh) {this.asPlacer.previewMesh = previewMesh;}

    public get heldObjects() {return this.asPlacer.heldObjects;}
    public set heldObjects(heldObjects) {this.asPlacer.heldObjects = heldObjects;}

    public get maxHeldObjects() {return this.asPlacer.maxHeldObjects;}
    public set maxHeldObjects(maxHeldObjects) {this.asPlacer.maxHeldObjects = maxHeldObjects;}

    public get objectGrid() {return this.asPlacer.objectGrid;}
    public set objectGrid(objectGrid) {this.asPlacer.objectGrid = objectGrid;}

    public get placementPosition() {return this.asPlacer.placementPosition;}
    public set placementPosition(placementPosition) {this.asPlacer.placementPosition = placementPosition;}

    public get getObjectToPlace() {return this.asPlacer.getObjectToPlace;}
    public set getObjectToPlace(getObjectToPlace) {this.asPlacer.getObjectToPlace = getObjectToPlace;}

    constructor(
        public asPlacer: Placer,
        public grid: MeshGrid
    ) {
        super();
        this.preview = this._defaultPreview.bind(this);
        this.unpreview = this._defaultUnpreview.bind(this);
        
        this.transformNode = grid.transformNode;
        this.createFollowVector = () => (new GridVector(
            this.followedNode.absolutePosition, this.grid.cellSize)).round();
        grid.map(this.unpreview.bind(this));
    }

    doMainAction() {
        this.asPlacer.doMainAction();
    }

    override onSelect(callback: (info: DSelectInfo) => void): void {
        this.asPlacer.onSelect(callback);
    }
    override offSelect(callback: (info: DSelectInfo) => void): void {
        this.asPlacer.offSelect(callback);
    }

    override onItemUseEnded(callback: () => void): void {
        this.asPlacer.onItemUseEnded(callback)
    }
    override offItemUseEnded(callback: () => void): void {
        this.asPlacer.offItemUseEnded(callback)
    }

    canPlaceHeldObject(): boolean {
        return this.asPlacer.canPlaceHeldObject();
    }
    
    placeHeldObject(): boolean {
        return this.asPlacer.placeHeldObject();
    }

    placeObject(object: Object): boolean {
        return this.asPlacer.placeObject(object);
    }

    setPreviewMeshFromObject(object: Object): void {
        this.asPlacer.setPreviewMeshFromObject(object);
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
            this.placementPosition = this.grid.meshes
                [this.pointedCell.x][this.pointedCell.y][this.pointedCell.z].absolutePosition;
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
            if (mesh.name.includes("MeshGrid:Prototype")) {
                this.previewMesh.setAbsolutePosition((mesh.parent as AbstractMesh).absolutePosition.clone());
            } else {
                this.previewMesh.setAbsolutePosition(mesh.absolutePosition.clone());
            }
            if (!this.previewMesh.isEnabled()) this.previewMesh.setEnabled(true);
        } else {
            if (mesh.name.includes("?MeshGrid:Wrapper") && !mesh.name.includes("MeshGrid:Prototype")) {
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
            if (mesh.name.includes("?MeshGrid:Wrapper") && !mesh.name.includes("MeshGrid:Prototype")) {
                mesh.getChildMeshes().at(0).visibility = 0.5;
            } else {
                mesh.visibility = 0.5;
            }
        }
        return mesh;
    }
}