import { Vector3 } from "@babylonjs/core";

/**
 * A vector that has an offset associated with it along 
 * with a shift operation that modifies the offset by a set amount.
 */
export default class ShiftVector {

    constructor(
        public vector: Vector3,
        public shift: Vector3
    ) {
    }

    /**
     * Return a new copy of the ShiftVector
     */
    clone() {
        return new ShiftVector(
            this.vector.clone(),
            this.shift.clone()
        );
    }

    /**
     * Returns a new Vector3 that has been positively shifted, i.e. 
     * this.vector + this.shift.
     */
    shiftPositive() {
        return this.vector.add(this.shift);
    }

    /**
     * Returns a new Vector3 that has been positively shifted, i.e. 
     * this.vector + this.shift.
     */
    shiftNegative() {
        return this.vector.subtract(this.shift);
    }
}