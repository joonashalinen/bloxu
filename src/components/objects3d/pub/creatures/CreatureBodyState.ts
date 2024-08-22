import { AnimationGroup, Vector3 } from "@babylonjs/core";
import ICreatureBodyState from "../../../computation/pub/ICreatureBodyState";
import IState from "../../../computation/pub/IState";
import State from "../../../computation/pub/State";
import CreatureBody from "./CreatureBody";
import Device from "../Device";

/**
 * Base class for ICreatureBodyState implementations.
 */
export default class CreatureBodyState  extends State implements ICreatureBodyState {
    playAnimation = (animation: AnimationGroup) => {animation.play()};
    protected _jumped: boolean = false;
    protected _moved: boolean = false;
    protected _originalPerpetualMotionSpeed: number;

    constructor(public creatureBody: CreatureBody) {
        super();
    }

    start(...args: unknown[]) {
        if (this.isActive) return;
        super.start();
        this._moved = false;
        this._jumped = false;
        this._originalPerpetualMotionSpeed = this.creatureBody
            .perpetualMotionSpeed;
        this.creatureBody.perpetualMotionSpeed = this.creatureBody.runSpeed;
    }

    end() {
        if (!this.isActive) return;
        super.end();
        this.creatureBody.perpetualMotionSpeed = 
            this._originalPerpetualMotionSpeed;
    }

    setPerpetualMotionDirection(direction: Vector3): void {
        if (!this.isActive) return;

        if (!this.creatureBody.perpetualMotionDirection.equals(direction)) {
            Device.prototype.setPerpetualMotionDirection.apply(
                this.creatureBody, [direction]);
            if (!direction.equals(Vector3.ZeroReadOnly)) {
                this._moved = true;
            }
        }
    }

    jump(): void {
        if (!this.isActive) return;
        this._jumped = true;
    }

    doItemMainAction(): void {
        if (!this.isActive) return;
        if (this.creatureBody.selectedItemName !== undefined) {
            const actionIndex = 0;
            this.endWithEvent("useItem", [actionIndex]);
        }
    }

    doItemSecondaryAction(): void {
        if (!this.isActive) return;
        if (this.creatureBody.selectedItemName !== undefined) {
            const actionIndex = 1;
            this.endWithEvent("useItem", [actionIndex]);
        }
    }

    doOnTick(passedTime: number, absoluteTime: number): void {
    }
}