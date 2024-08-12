import { AbstractMesh } from "@babylonjs/core";
import DPlayerBody from "./DPlayerBody";
import CreatureBody, { TCreatureAnimations } from "../../../../components/objects3d/pub/creatures/CreatureBody";
import Physical from "../../../../components/objects3d/pub/Physical";

/**
 * The body that the Player service owns and controls.
 */
export default class PlayerBody extends CreatureBody {
    deathAltitude: number = -40;

    constructor(
        characterMesh: AbstractMesh | Physical,
        animations: TCreatureAnimations
    ) {
        super(characterMesh, animations);
    }

    /**
     * Update player's body for the current render iteration.
     */
    doOnTick(passedTime: number, absoluteTime: number) {
        super.doOnTick(passedTime, absoluteTime);
        const currentAltitude = this.transformNode.absolutePosition.y;
        if (currentAltitude < this.deathAltitude) {
            this.emitter.trigger("hitDeathAltitude");
        }
    }

    /**
     * Returns the state of the PlayerBody as 
     * a data object.
     */
    state(): DPlayerBody {
        const position = this.transformNode.position;
        return {
            position: {
                x: position.x,
                y: position.y,
                z: position.z
            },
            rotationAngle: this.horizontalAngle()
        };
    }

    /**
     * Sets the inner state of the PlayerBody to reflect 
     * the state represented in the given data object.
     */
    setState(state: DPlayerBody) {
        const pos = state.position;
        this.transformNode.position.set(pos.x, pos.y, pos.z);
        this.setHorizontalAngle(state.rotationAngle);
    }
}