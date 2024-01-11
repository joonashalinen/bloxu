import { TransformNode, Vector3 } from "@babylonjs/core";
import IObject from "./IObject";
import IShiftable from "./IShiftable";

/**
 * An object that can be shifted by a set shift vector.
 */
export default class Shiftable implements IShiftable, IObject {
    appliedShift: "positive" | "negative" | "none" = "none";
    appliedShiftVector: Vector3 = new Vector3(0, 0, 0);
    
    constructor(
        public transformNode: TransformNode,
        public shift: Vector3
    ) {
        
    }

    /**
     * Resets the object to have no shift applied.
     */
    reset() {
        this.transformNode.position.add(this.appliedShiftVector.scale(-1));
        this.appliedShiftVector = new Vector3(0, 0, 0);
        this.appliedShift = "none";
        return this;
    }

    /**
     * Shifts by the shift vector positively.
     */
    shiftPositive() {
        if (this.appliedShift === "none") {
            this.transformNode.position = this.transformNode.position.add(this.shift);
            this.appliedShift = "positive";
            this.appliedShiftVector = this.shift.clone();
        }
        return this;
    }

    /**
     * Shifts by the shift vector negatively.
     */
    shiftNegative() {
        if (this.appliedShift === "none") {
            this.transformNode.position = this.transformNode.position.add(
                this.shift.scale(-1)
            );
            this.appliedShift = "negative";
            this.appliedShiftVector = this.shift.scale(-1);
        }
        return this;
    }
}