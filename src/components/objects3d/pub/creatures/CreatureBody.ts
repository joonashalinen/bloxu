import { AbstractMesh, AnimationGroup, Vector3 } from "@babylonjs/core";
import Device from "../Device";
import Physical from "../Physical";
import StateMachine from "../../../computation/pub/StateMachine";
import ICreatureBodyState from "../../../computation/pub/ICreatureBodyState";
import JumpState from "./JumpState";
import AirborneState from "./AirborneState";
import MoveState from "./MoveState";
import IdleState from "./IdleState";
import IItem from "../items/IItem";
import UseItemState from "./UseItemState";
import ICreatureBodyActions from "./ICreatureBodyActions";
import DVector2 from "../../../graphics3d/pub/DVector2";

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
    deathAltitude: number = -40;
    isDead: boolean = false;
    respawnPoint: Vector3 = new Vector3(0, 0, 0);
    respawnOnDeath: boolean = false;
    actionStateMachine: StateMachine<ICreatureBodyState>;
    items: {[name: string]: IItem<unknown, unknown>} = {};
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
        const itemToSelect = this.items[itemName];
        if (itemToSelect === undefined) {
            throw new Error("No item '" + itemName + "' owned by CreatureBody");
        }
        this.selectedItemName = itemName;
        itemToSelect.activate();
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

    /**
     * The item that is currently held by the creature 
     * if an item is held.
     */
    selectedItem() {
        if (this.selectedItemName !== undefined) {
            return this.items[this.selectedItemName];
        } else {
            return undefined;
        }
    }

    doOnTick(passedTime: number, absoluteTime: number) {
        if (this.isInVoid) return;
        const currentAltitude = this.transformNode.absolutePosition.y;
        if (currentAltitude < this.deathAltitude) {
            this.isDead = true;
            if (this.respawnOnDeath) this.respawn();
            this.emitter.trigger("hitDeathAltitude");
        } else {
            this.actionStateMachine.firstActiveState().doOnTick(
                passedTime, absoluteTime);
            const selectedItem = this.selectedItem();
            if (selectedItem !== undefined) {
                selectedItem.doOnTick(passedTime, absoluteTime);
            }
        }
        super.doOnTick(passedTime, absoluteTime);
    }

    point(position: DVector2) {
        
    }

    /**
     * Teleports the creature into the void, making it no longer responsive.
     */
    teleportToVoid() {
        if (this.isInVoid) return;
        const selectedItem = this.selectedItem();
        if (selectedItem !== undefined && selectedItem.transformNode !== undefined) {
            selectedItem.transformNode.setEnabled(false);
        }
        super.teleportToVoid();
    }

    /**
     * Undoes the effect of .teleportToVoid().
     */
    bringBackFromTheVoid() {
        if (!this.isInVoid) return;
        const selectedItem = this.selectedItem();
        if (selectedItem !== undefined && selectedItem.transformNode !== undefined) {
            selectedItem.transformNode.setEnabled(true);
        }
        super.bringBackFromTheVoid();
    }

    /**
     * Listen to the 'hitDeathAltitude' event, which is 
     * triggered when the creature body falls below .deathAltitude.
     */
    onHitDeathAltitude(callback: () => void) {
        this.emitter.on("hitDeathAltitude", callback);
    }

    offHitDeathAltitude(callback: () => void) {
        this.emitter.off("hitDeathAltitude", callback);
    }

    /**
     * Make the creature body go back to its spawn point
     * and become alive again, if it was dead.
     */
    respawn() {
        this.isDead = false;
        this.transformNode.setAbsolutePosition(this.respawnPoint);
    }

    /**
     * Destroys the CreatureBody and the items owned by it.
     */
    destroy() {
        super.destroy();
        Object.values(this.items).forEach((item) => { item.destroy(); });
    }
}