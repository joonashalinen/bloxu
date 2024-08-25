import { AnimationGroup, Vector3 } from "@babylonjs/core";
import ICreatureBodyState from "../../../computation/pub/ICreatureBodyState";
import CreatureBody from "./CreatureBody";
import IItem from "../items/IItem";
import CreatureBodyState from "./CreatureBodyState";
import Device from "../Device";

/**
 * A state of a Creature where the Creature 
 * is in the process of using an item.
 */
export default class UseItemState extends CreatureBodyState implements ICreatureBodyState {
    name = "useItem";
    itemName: string;
    private _itemUseEnded: boolean = false;
    private _item: IItem;

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
        this.itemName = this.creatureBody.selectedItemName;
        this._item = this.creatureBody.items[this.itemName];
        if (this._item === undefined) {
            throw new Error("Entered UseItemState with no item selected.");
        }
        this._itemUseEnded = false;

        this.creatureBody.horizontalRotationEnabled = false;
        this.creatureBody.ownsRotationAnimations = false;
        this.creatureBody.perpetualMotionSpeed = 0;
        this.creatureBody.directionalAnimation.disable();
        this.creatureBody.horizontalRotationAnimation.disable();

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
        this._item.offItemUseEnded(this._handleItemUseEnded);
    }

    jump(): void {
        // No jumping allowed by default.
    }

    doOnTick(passedTime: number, absoluteTime: number): void {
        if (!this.isActive) return;
        if (this._itemUseEnded) {
            super.doOnTick(passedTime, absoluteTime);
            if (!this.isActive) return;
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