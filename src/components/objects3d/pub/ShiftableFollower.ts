import { TransformNode, Vector3 } from "@babylonjs/core";
import IFollower from "./IFollower";
import IObject from "./IObject";
import IShiftable from "./IShiftable";

/**
 * An IFollower implementation that is also an IShiftable.
 */
export default class ShiftableFollower implements IShiftable, IFollower, IObject {
    public get appliedShift(): "positive" | "negative" | "none" {
        return this.shiftable.appliedShift;
    }
    public set appliedShift(value: "positive" | "negative" | "none") {
        this.shiftable.appliedShift = value;
    }

    public get shift(): Vector3 {
        return this.shiftable.shift;
    }
    public set shift(value: Vector3) {
        this.shiftable.shift = value;
    }

    public get trackedMesh(): TransformNode {
        return this.follower.trackedMesh;
    }
    public set trackedMesh(value: TransformNode) {
        this.follower.trackedMesh = value;
    }

    public get offset(): Vector3 {
        return this.follower.offset;
    }
    public set offset(value: Vector3) {
        this.baseFollowerOffset = value;
        this.follower.offset = value;
    }

    public get transformNode(): TransformNode {
        return this.follower.transformNode;
    }
    public set transformNode(value: TransformNode) {
        this.follower.transformNode = value;
    }

    public get appliedShiftVector(): Vector3 {
        return this.shiftable.appliedShiftVector;
    }
    public set appliedShiftVector(value: Vector3) {
        this.shiftable.appliedShiftVector = value;
    }

    baseFollowerOffset: Vector3;

    constructor(
        public shiftable: IShiftable,
        public follower: IFollower & IObject
    ) {
        this.baseFollowerOffset = follower.offset.clone();
    }

    update(): IFollower {
        this.follower.offset = this.baseFollowerOffset.add(this.shiftable.appliedShiftVector);
        this.follower.update();
        return this;
    }

    reset(): IShiftable {
        this.shiftable.reset();
        this.update();
        return this;
    }

    shiftPositive(): IShiftable {
        this.shiftable.shiftPositive();
        this.update();
        return this;
    }

    shiftNegative(): IShiftable {
        this.shiftable.shiftNegative();
        this.update();
        return this;
    }
}