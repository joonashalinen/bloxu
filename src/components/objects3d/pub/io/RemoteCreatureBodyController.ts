import IController, { DStateUpdate } from "../../../controls/pub/IController";
import RemoteController from "../../../controls/pub/RemoteController";
import DVector2 from "../../../graphics3d/pub/DVector2";
import CreatureBody from "../creatures/CreatureBody";

/**
 * A controller for a CreatureBody that mimics the state of 
 * another CreatureBody most likely on another game instance 
 * connected via a network.
 */
export default class RemoteCreatureBodyController extends RemoteController {
    constructor(controller: IController) {
        super(controller);
    }

    /**
     * Default implementation for changeDirection that does nothing 
     * except state handling. This makes sense because the direction is by default
     * relative to the camera angle, which we cannot assume to be the 
     * same in the local game as it is in the remote game.
     */
    override changeDirection(direction: DVector2, directionControllerIndex: number,
        updateState: DStateUpdate<CreatureBody>) {
        return this._doWithReferenceState("changeDirection", updateState, () => {});
    }

    /**
     * Default implementation for changeDirection that does nothing 
     * except state handling. This makes sense because the pointer position is
     * relative to the camera angle, which we cannot assume to be the 
     * same in the local game as it is in the remote game.
     */
    override point(pointerPosition: DVector2, pointerIndex: number,
        updateState: DStateUpdate<CreatureBody>) {
        return this._doWithReferenceState("point", updateState, () => {});
    }
}