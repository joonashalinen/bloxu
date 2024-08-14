import { AbstractMesh, AnimationGroup, Vector3 } from "@babylonjs/core";
import Device from "../Device";
import Physical from "../Physical";
import StateMachine from "../../../computation/pub/StateMachine";
import ICreatureBodyState from "../../../computation/pub/ICreatureBodyState";
import JumpState from "./JumpStateV2";
import AirborneState from "./AirborneState";
import MoveState from "./MoveStateV2";
import IdleState from "./IdleStateV2";
import IItem from "./IItem";
import UseItemState from "./UseItemState";
import ICreatureBodyActions from "./ICreatureBodyActions";

export interface TCreatureAnimations {
    "jump": AnimationGroup,
    "hover": AnimationGroup,
    "idle": AnimationGroup
}

/**
 * The body of a creature, whether a land animal, 
 * sea animal or a humanoid.
 */
export default class CreatureBody extends Device implements ICreatureBodyActions {
    runSpeed: number = 10;
    actionStateMachine: StateMachine<ICreatureBodyState>;
    items: {[name: string]: IItem} = {};
    selectedItemName: string;

    constructor(wrappee: AbstractMesh | Physical, 
        animations: TCreatureAnimations) {
        super(wrappee);
        this.actionStateMachine = new StateMachine({
            "jump": new JumpState(this, animations.jump),
            "airborne": new AirborneState(this, animations.hover),
            "move": new MoveState(this),
            "idle": new IdleState(this, animations.idle),
            "useItem": new UseItemState(this)
        }, "idle");
    }

    selectItem(itemName: string) {
        if (this.items[itemName] === undefined) {
            throw new Error("No item '" + itemName + "' owned by CreatureBody");
        }
        this.selectedItemName = itemName;
    }

    doItemMainAction(): void {
        this.actionStateMachine.firstActiveState().doItemMainAction();
    }

    doItemSecondaryAction(): void {
        this.actionStateMachine.firstActiveState().doItemSecondaryAction();
    }

    setPerpetualMotionDirection(direction: Vector3): void {
        this.actionStateMachine.firstActiveState().setPerpetualMotionDirection(direction);
    }

    jump(): void {
        this.actionStateMachine.firstActiveState().jump();
    }

    doOnTick(passedTime: number, absoluteTime: number) {
        this.actionStateMachine.firstActiveState().doOnTick(
            passedTime, absoluteTime);
        Object.values(this.items).forEach((item) => item.doOnTick(
            passedTime, absoluteTime));
        super.doOnTick(passedTime, absoluteTime);
    }
}