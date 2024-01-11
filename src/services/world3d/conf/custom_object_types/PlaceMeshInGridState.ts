import { Mesh, MeshBuilder, TransformNode, Vector3 } from "@babylonjs/core";
import IState from "../../../../components/computation/pub/IState";
import EventEmitter from "../../../../components/events/pub/EventEmitter";
import IEventable from "../../../../components/events/pub/IEventable";
import EventableMovable from "../../../../components/objects3d/pub/EventableMovable";
import MeshGrid from "../../../../components/objects3d/pub/MeshGrid";
import PointablePlacementGrid from "../../../../components/objects3d/pub/menus/PointablePlacementGrid";
import { IPointable } from "../../../../components/graphics2d/pub/IPointable";
import IActionableState from "../../../../components/objects3d/pub/creatures/IActionableState";
import PlacementGrid from "../../../../components/objects3d/pub/menus/PlacementGrid";
import Physical from "../../../../components/objects3d/pub/Physical";
import IKeyableState from "../../../../components/objects3d/pub/creatures/IKeyableState";
import ITickable from "../../../../components/objects3d/pub/ITickable";
import Shiftable from "../../../../components/objects3d/pub/Shiftable";
import GridFollower from "../../../../components/objects3d/pub/GridFollower";
import ShiftableFollower from "../../../../components/objects3d/pub/ShiftableFollower";
import IObject from "../../../../components/objects3d/pub/IObject";

/**
 * A state of a movable creature where they can place 
 * a mesh in a surrounding grid. The mesh is placed 
 * via a pointer trigger event (e.g. a mouse click).
 */
export default class PlaceMeshInGridState implements IState, IEventable, IPointable, IActionableState, IKeyableState, ITickable {
    isActive: boolean = false;
    emitter = new EventEmitter();
    placementGrid: PointablePlacementGrid;
    blockSize: number;
    shiftableGrid: Shiftable;
    gridFollower: GridFollower;
    shiftableFollower: ShiftableFollower;

    constructor(
        public baseId: string,
        public movedMesh: TransformNode,
        public grid: MeshGrid,
        public makeObject: (id: string) => IObject | Physical
    ) {
        grid.transformNode.setEnabled(false);

        // Calculate the initial shift of the grid to make it be located at the 
        // base of the character.
        const characterBoundingPoints = this.movedMesh.getHierarchyBoundingVectors();
        const characterHeight = characterBoundingPoints.max.y - characterBoundingPoints.min.y;
        const characterWidth = characterBoundingPoints.max.x - characterBoundingPoints.min.x;

        // Make a GridFollower to implement making the 
        // grid follow the character.
        this.gridFollower = new GridFollower(
            this.grid.transformNode,
            this.movedMesh,
            this.grid.cellSize,
            new Vector3((-1) * this.grid.cellSize, (-1) * characterHeight/2, (-1) * this.grid.cellSize * (1/2))
        );

        // Calculate size of the block that is being used.
        const blockBoundingPoints = grid.meshPrototype.getHierarchyBoundingVectors();
        this.blockSize = blockBoundingPoints.max.x - blockBoundingPoints.min.x;

        // Make a Shiftable from the grid so that we can implement shifting 
        // it up / down.
        this.shiftableGrid = new Shiftable(grid.transformNode, new Vector3(0, this.blockSize, 0));

        // Make a ShiftableFollower to coordinate between the Follower and the Shiftable.
        this.shiftableFollower = new ShiftableFollower(this.shiftableGrid, this.gridFollower);

        const placementGrid = new PlacementGrid(
            grid,
            () => {
                const obj = this.makeObject(`PlaceMeshInGridState:object?${this.baseId}`);
                if ("physicsAggregate" in obj) {
                    // We need to do this so that the position of the mesh can 
                    // be updated afterwards.
                    obj.physicsAggregate.body.disablePreStep = false;
                }
                return obj;
            }
        );
        placementGrid.setPosition = (obj, position) => {
            (obj as Physical).physicsAggregate.body.transformNode.setAbsolutePosition(position);
        };

        this.placementGrid = new PointablePlacementGrid(
            grid,
            placementGrid
        );
    }

    doOnTick(time: number): ITickable {
        if (this.isActive) {
            this.shiftableFollower.update();
        }
        return this;
    }

    pressFeatureKey(key: string): IKeyableState {
        if (this.isActive) {
            if (key === "shift") {
                console.log("shifting");
                this.shiftableFollower.shiftNegative();
            } else if (key === " ") {
                this.shiftableFollower.shiftPositive();
            }
        }
        return this;
    }

    releaseFeatureKey(key: string): IKeyableState {
        if (this.isActive) {
            if (key === "shift" || key === " ") {
                this.shiftableFollower.reset();
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
            this.gridFollower.update();
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
}