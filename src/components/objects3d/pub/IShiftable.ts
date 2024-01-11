import { Vector3 } from "@babylonjs/core";

export default interface IShiftable {
    appliedShift: "positive" | "negative" | "none";
    shift: Vector3;
    appliedShiftVector: Vector3;
    
    reset(): IShiftable;
    shiftPositive(): IShiftable;
    shiftNegative(): IShiftable;
}