import { Vector3 } from "@babylonjs/core";
import Object from "./Object";
import GridVector from "../../graphics3d/pub/GridVector";

/**
 * A 3D grid for placing and maintaining objects in.
 */
export default class ObjectGrid {
    objectsByCoordinates: {[coordinates: string]: Object} = {};
    coordinatesByObjectIds: {[objectId: string]: Vector3} = {};
    positionRoundingPolicy: "floor" | "ceil" | "round" = "round";

    constructor(public cellSize: number = 1) {
        
    }

    /**
     * Returns the coordinates of the cell that contains the
     * given absolute position.
     */
    positionToCoordinates(absolutePosition: Vector3) {
        const gridSnappedPosition = (new GridVector(absolutePosition, this.cellSize)
            )[this.positionRoundingPolicy]();
        return gridSnappedPosition.scaleInPlace(1 / this.cellSize);
    }

    /**
     * Returns the center absolute position of the cell 
     * at the given coordinates.
     */
    coordinatesToPosition(coordinates: Vector3) {
        return coordinates.scale(this.cellSize);
    }

    /**
     * Places the given object at the center of the cell
     * that contains the given absolute position.
     */
    placeAtPosition(absolutePosition: Vector3, object: Object) {
        const cellCoordinates = this.positionToCoordinates(absolutePosition);
        this.placeAtCoordinates(cellCoordinates, object);
    }

    /**
     * Place the given object at the center of the cell with the given cell coordinates. 
     * If the object is already in the grid, the object is moved.
     */
    placeAtCoordinates(coordinates: Vector3, object: Object) {
        this.setObjectAtCoordinates(coordinates, object);
        object.setAbsolutePosition(this.coordinatesToPosition(coordinates));
    }

    /**
     * Sets the object given to be present at the given coordinates. 
     * Unlike .placeAtCoordinates, this method will not affect the object's 
     * mesh, it will only update the bookkeeping of ObjectGrid.
     */
    setObjectAtCoordinates(coordinates: Vector3, object: Object) {
        const existingCoordinates = this.coordinatesByObjectIds[object.id];
        if (existingCoordinates !== undefined) {
            this.clearCellAt(existingCoordinates);
        }
        this.objectsByCoordinates[coordinates.toString()] = object;
        this.coordinatesByObjectIds[object.id] = coordinates;
    }

    /**
     * Whether the cell with the given coordinates already has an object in it.
     */
    cellIsOccupied(coordinates: Vector3) {
        return this.objectsByCoordinates[coordinates.toString()] !== undefined;
    }

    /**
     * Whether the cell containing the given absolute position already
     * has an object in it.
     */
    cellIsOccupiedAtPosition(absolutePosition: Vector3) {
        return this.cellIsOccupied(this.positionToCoordinates(absolutePosition));
    }

    /**
     * Removes the object present at the cell with the given coordinates.
     * The removed value is returned.
     */
    clearCellAt(coordinates: Vector3) {
        const coordinateString = coordinates.toString();
        const existingObject = this.objectsByCoordinates[coordinateString];
        if (existingObject !== undefined) {
            delete this.coordinatesByObjectIds[existingObject.id];
        }
        delete this.objectsByCoordinates[coordinateString];
        return existingObject;
    }
}