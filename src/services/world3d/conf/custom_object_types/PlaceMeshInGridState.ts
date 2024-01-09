import { MeshBuilder, TransformNode, Vector3 } from "@babylonjs/core";
import IState from "../../../../components/computation/pub/IState";
import EventEmitter from "../../../../components/events/pub/EventEmitter";
import IEventable from "../../../../components/events/pub/IEventable";
import EventableMovable from "../../../../components/objects3d/pub/EventableMovable";
import IMovable from "../../../../components/objects3d/pub/IMovable";
import MeshGrid from "../../../../components/objects3d/pub/MeshGrid";
import GridVector from "../../../../components/graphics3d/pub/GridVector";
import PointablePlacementGrid from "../../../../components/objects3d/pub/menus/PointablePlacementGrid";
import { IPointable } from "../../../../components/graphics2d/pub/IPointable";
import IActionableState from "../../../../components/objects3d/pub/creatures/IActionableState";
import PlacementGrid from "../../../../components/objects3d/pub/menus/PlacementGrid";
import Object from "../../../../components/objects3d/pub/Object";
import Physical from "../../../../components/objects3d/pub/Physical";
import IKeyableState from "../../../../components/objects3d/pub/creatures/IKeyableState";

/**
 * A state of a movable creature where they can place 
 * a mesh in a surrounding grid. The mesh is placed 
 * via a pointer trigger event (e.g. a mouse click).
 */
export default class PlaceMeshInGridState implements IState, IEventable, IPointable, IActionableState, IKeyableState {
    isActive: boolean = false;
    emitter = new EventEmitter();
    placementGrid: PointablePlacementGrid;
    gridOffset: Vector3 = new Vector3(0, 0, 0);

    constructor(
        public baseId: string,
        public movable: EventableMovable, 
        public movedMesh: TransformNode,
        public grid: MeshGrid
    ) {
        grid.transformNode.setEnabled(false);
        this.placementGrid = new PointablePlacementGrid(
            grid,
            new PlacementGrid(
                grid,
                () => {
                    const physical = new Physical(
                        MeshBuilder.CreateBox(
                            `PlaceMeshInGridState:mesh?${this.baseId}`, {size: grid.cellSize},
                            this.movable.transformNode.getScene()
                        ),
                        0
                    );
                    // We need to do this so that the position of the mesh can 
                    // be updated afterwards.
                    physical.physicsAggregate.body.disablePreStep = false;
                    return physical;
                }
            )
        );
        movable.emitter.on("move", this._updateGridPosition.bind(this));
    }

    pressFeatureKey(key: string): IKeyableState {
        if (this.isActive) {
            if (key === "shift") {
                this.gridOffset = new Vector3(0, (-1) * this.grid.gridSize.y, 0);
                this._updateGridPosition();
            } else if (key === " ") {
                this.gridOffset = new Vector3(0, this.grid.gridSize.y, 0);
                this._updateGridPosition();
            }
        }
        return this;
    }

    releaseFeatureKey(key: string): IKeyableState {
        if (this.isActive) {
            if (key === "shift" || key === " ") {
                this.gridOffset = new Vector3(0, 0, 0);
                this._updateGridPosition();
            }
        }
        return this;
    }

    doMainAction(): IActionableState {
        if (this.isActive) {
            this.placementGrid.place();
        }
        return this;
    }

    point(pointerPosition: { x: number; y: number; }): IPointable {
        if (this.isActive) {
            this.placementGrid.point(pointerPosition);
        }
        return this;
    }

    triggerPointer(pointerPosition: { x: number; y: number; }, buttonIndex: number): IPointable {
        return this;
    }

    start(...args: unknown[]): unknown {
        if (!this.isActive) {
            this.isActive = true;
            this.grid.transformNode.setEnabled(true);
            this._updateGridPosition();
        }
        return this;
    }

    end(): unknown {
        if (this.isActive) {
            this.isActive = false;
            this.grid.transformNode.setEnabled(false);
        }
        return this;
    }

    onEnd(callback: (nextStateId: string, ...args: unknown[]) => void): IState {
        this.emitter.on("end", callback);
        return this;
    }

    /**
     * Make the grid update its position so that it is 
     * centered at the character's location.
     */
    private _updateGridPosition() {
        this.grid.transformNode.setAbsolutePosition(
            (new GridVector(this.movedMesh.absolutePosition, this.grid.cellSize))
            .round()
            .subtract(
                (new Vector3(this.grid.gridSize.x, this.grid.gridSize.y * 3, this.grid.gridSize.z))
                .scale(1/2)
            )
            .add(this.gridOffset)
        );
    }
}