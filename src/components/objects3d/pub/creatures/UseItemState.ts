import { AnimationGroup, Vector3 } from "@babylonjs/core";
import ICreatureBodyState from "../../../computation/pub/ICreatureBodyState";
import CreatureBody from "./CreatureBody";
import IItem from "./IItem";
import CreatureBodyState from "./CreatureBodyState";
import Device from "../Device";

/**
 * A state of a Creature where the Creature 
 * is in the process of using an item.
 */
export default class UseItemState extends CreatureBodyState implements ICreatureBodyState {
    itemName: string;
    nextState: string = "idle";
    private _itemUseEnded: boolean = false;
    private _item: IItem;
    private _rotationAnimationEnabled: boolean;
    private _bodyOwnsRotationAnimations: boolean;
    private _horizontalRotationEnabled: boolean;

    constructor(creatureBody: CreatureBody) {
        super(creatureBody);
    }

    doItemMainAction(): void {
        // Cannot use items when already in the process of using one.
    }

    doItemSecondaryAction(): void {
        // Cannot use items when already in the process of using one.
    }

    start(actionIndex: number) {
        if (this.isActive) return;
        super.start();
        this._itemUseEnded = false;
        this.itemName = this.creatureBody.selectedItemName;
        this._item = this.creatureBody.items[this.itemName];

        this._horizontalRotationEnabled = this.creatureBody
            .horizontalRotationEnabled;
        this.creatureBody.horizontalRotationEnabled = false;

        this._rotationAnimationEnabled = this.creatureBody
            .horizontalRotationAnimation.enabled();
        this._bodyOwnsRotationAnimations = this.creatureBody
            .ownsRotationAnimations;
        this.creatureBody.ownsRotationAnimations = false;
        this.creatureBody.perpetualMotionSpeed = 0;

        if (this._rotationAnimationEnabled) {
            this.creatureBody.horizontalRotationAnimation.disable();
        }

        if (this._item === undefined) {
            throw new Error("Entered UseItemState with no item selected.");
        }

        this._item.aimedDirection = this.creatureBody.facedDirection();
        this._item.onItemUseEnded(this._handleItemUseEnded);

        if (actionIndex === 0) {
            this._item.doMainAction();
        } else {
            this._item.doSecondaryAction();
        }
    }

    end() {
        if (!this.isActive) return;
        super.end();
        this.creatureBody.horizontalRotationEnabled = this
            ._horizontalRotationEnabled;
        if (this._rotationAnimationEnabled) {
            this.creatureBody.horizontalRotationAnimation.enable();
        }
        this.creatureBody.ownsRotationAnimations = this
            ._bodyOwnsRotationAnimations;
        this._item.offItemUseEnded(this._handleItemUseEnded);
    }

    jump(): void {
        // No jumping allowed by default.
    }

    doOnTick(passedTime: number, absoluteTime: number): void {
        if (!this.isActive) return;
        if (this._itemUseEnded) {
            if (!this.creatureBody.perpetualMotionDirection.equals(
                Vector3.ZeroReadOnly)) {
                this.endWithEvent("move");
            } else {
                this.endWithEvent("idle");
            }
        }
    }

    private _handleItemUseEnded = () => {
        if (!this.isActive) return;
        this._itemUseEnded = true;
    }
}