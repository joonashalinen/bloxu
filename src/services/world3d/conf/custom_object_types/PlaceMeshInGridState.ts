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
import EventablePlaceable from "../../../../components/objects3d/pub/menus/EventablePlaceable";
import EventablePlacementGrid from "../../../../components/objects3d/pub/menus/EventablePlacementGrid";

/**
 * A state of a movable creature where they can place 
 * a mesh in a surrounding grid. The mesh is placed 
 * via a pointer trigger event (e.g. a mouse click).
 */
export default class PlaceMeshInGridState implements IState, IEventable, IPointable, IActionableState, IKeyableState, ITickable {
    isActive: boolean = false;
    emitter = new EventEmitter();
    pointablePlacementGrid: PointablePlacementGrid<EventablePlacementGrid>;
    blockSize: number;
    shiftableGrid: Shiftable;
    gridFollower: GridFollower;
    shiftableFollower: ShiftableFollower;
    characterHeight: number = 1.8;
    eventablePlacementGrid: EventablePlacementGrid;
    placementGrid: PlacementGrid;

    constructor(
        public baseId: string,
        public movedMesh: TransformNode,
        public grid: MeshGrid,
        public makeObject: (id: string) => IObject | Physical
    ) {
        grid.transformNode.setEnabled(false);

        // Calculate size of the block that is being used.
        const blockBoundingPoints = grid.meshPrototype.getHierarchyBoundingVectors();
        this.blockSize = blockBoundingPoints.max.x - blockBoundingPoints.min.x;

        // Make a GridFollower to implement making the 
        // grid follow the character.
        this.gridFollower = new GridFollower(
            this.grid.transformNode,
            this.movedMesh,
            this.grid.cellSize,
            // y-value is minused by an extra 0.1 to make shifting work. Otherwise 
            // shifting will result in an offset that is as far away from the neutral block level 
            // as it is from the lower one that we want to snap to.
            new Vector3((-1) * this.grid.cellSize, (-1) * this.characterHeight/2 - 0.1, (-1) * this.grid.cellSize * (1/2))
        );

        // Make a Shiftable from the grid so that we can implement shifting 
        // it up / down.
        this.shiftableGrid = new Shiftable(grid.transformNode, new Vector3(0, this.blockSize, 0));

        // Make a ShiftableFollower to coordinate between the Follower and the Shiftable.
        this.shiftableFollower = new ShiftableFollower(this.shiftableGrid, this.gridFollower);

        this.placementGrid = new PlacementGrid(
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
        this.placementGrid.setPosition = (obj, position) => {
            (obj as Physical).physicsAggregate.body.transformNode.setAbsolutePosition(position);
        };

        this.eventablePlacementGrid = new EventablePlacementGrid(this.placementGrid);

        this.pointablePlacementGrid = new PointablePlacementGrid(
            grid,
            this.eventablePlacementGrid
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
            this.pointablePlacementGrid.place();
        }
        return this;
    }

    point(pointerPosition: { x: number; y: number; }): IPointable {
        if (this.isActive) {
            this.pointablePlacementGrid.point(pointerPosition);
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