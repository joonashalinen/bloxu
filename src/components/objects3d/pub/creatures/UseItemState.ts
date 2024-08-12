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
    private _perpetualMotionDirection: Vector3 = new Vector3(0, 0, 0);
    private _animation: AnimationGroup;
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

        const animationName = this.creatureBody
            .itemUseAnimations[this.itemName] === 
            undefined ? this.itemName : "*";
        
        if (this.creatureBody.itemUseAnimations[animationName] !== 
            undefined) {
            
            this._animation = this.creatureBody
                .itemUseAnimations[animationName];
            this._animation.play();
        } else {
            this._animation = undefined;
        }
        
        this._perpetualMotionDirection = this.creatureBody
            .perpetualMotionDirection.clone();

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
        if (this._animation !== undefined) {
            this._animation.stop();
        }
    }

    setPerpetualMotionDirection(direction: Vector3): void {
        if (!this.isActive) return;
        this._perpetualMotionDirection = direction;
    }

    jump(): void {
        // No jumping allowed by default.
    }

    doOnTick(passedTime: number, absoluteTime: number): void {
        if (!this.isActive) return;
        if (this._itemUseEnded) {
            if (!this._perpetualMotionDirection.equals(Vector3.ZeroReadOnly)) {
                Device.prototype.setPerpetualMotionDirection.apply(
                    this.creatureBody, [this._perpetualMotionDirection]);
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