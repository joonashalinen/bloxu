import { Vector3 } from "@babylonjs/core";

/**
 * A vector that 'snaps' to a grid.
 */
export default class GridVector {
    constructor(
        public value: Vector3,
        public cellSize: number,
        public offset: Vector3 = new Vector3(0, 0, 0)
    ) {
        
    }

    /**
     * Rounds down to the nearest lesser grid point.
     */
    floor() {
        return (new Vector3(
            Math.floor(this.value.x/this.cellSize) * this.cellSize,
            Math.floor(this.value.y/this.cellSize) * this.cellSize,
            Math.floor(this.value.z/this.cellSize) * this.cellSize,
        )).add(this.offset);
    }

    /**
     * Rounds up to the nearest greater grid point.
     */
    ceil() {
        return (new Vector3(
            Math.ceil(this.value.x/this.cellSize) * this.cellSize,
            Math.ceil(this.value.y/this.cellSize) * this.cellSize,
            Math.ceil(this.value.z/this.cellSize) * this.cellSize,
        )).add(this.offset);
    }

    /**
     * Rounds to the nearest lesser grid point.
     */
    round() {
        return (new Vector3(
            Math.round(this.value.x/this.cellSize) * this.cellSize,
            Math.round(this.value.y/this.cellSize) * this.cellSize,
            Math.round(this.value.z/this.cellSize) * this.cellSize,
        )).add(this.offset);
    }
}