import { Vector3 } from "@babylonjs/core";
import IPlaceable from "./IPlaceable";
import IEventable from "../../../events/pub/IEventable";
import EventEmitter from "../../../events/pub/EventEmitter";
import PlacementGrid from "./PlacementGrid";

/**
 * An IPlaceable implementation that triggers
 * events.
 */
export default class EventablePlacementGrid implements IPlaceable, IEventable {
    emitter = new EventEmitter();

    constructor(public placementGrid: PlacementGrid) {
        
    }

    place(cell: Vector3): EventablePlacementGrid {
        this.placementGrid.place(cell);
        const absolutePosition = this.placementGrid.grid.meshes[cell.x][cell.y][cell.z].absolutePosition;
        this.emitter.trigger("place", [cell, absolutePosition]);
        return this;
    }
}