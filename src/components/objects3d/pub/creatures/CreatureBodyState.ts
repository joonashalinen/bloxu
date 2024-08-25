import { AnimationGroup, IPhysicsCollisionEvent, Vector3 } from "@babylonjs/core";
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
    protected _landed = false;
    protected _restoreRotationAnimation: boolean;
    protected _restoreDirectionalAnimation: boolean;
    protected _creatureOwnsRotationAnimations: boolean;
    protected _horizontalRotationEnabled: boolean;

    constructor(public creatureBody: CreatureBody) {
        super();
        this.creatureBody.onLanding(this._handleLandingEvent.bind(this));
    }

    start(...args: unknown[]) {
        if (this.isActive) return;
        super.start();
        this._moved = false;
        this._jumped = false;
        this._landed = false;

        this._restoreRotationAnimation = (
            this.creatureBody.horizontalRotationAnimation !== undefined && 
            this.creatureBody.horizontalRotationAnimation.enabled()
        );
        this._restoreDirectionalAnimation = (
            this.creatureBody.directionalAnimation !== undefined && 
            this.creatureBody.directionalAnimation.enabled()
        );
        this._creatureOwnsRotationAnimations = this.creatureBody.ownsRotationAnimations;
        this._horizontalRotationEnabled = this.creatureBody.horizontalRotationEnabled;

        this._originalPerpetualMotionSpeed = this.creatureBody.perpetualMotionSpeed;
        this.creatureBody.perpetualMotionSpeed = this.creatureBody.runSpeed;
    }

    end() {
        if (!this.isActive) return;
        super.end();
        this.creatureBody.perpetualMotionSpeed = this._originalPerpetualMotionSpeed;

        this.creatureBody.ownsRotationAnimations = this._creatureOwnsRotationAnimations;
        if (this._restoreRotationAnimation) {
            this.creatureBody.horizontalRotationAnimation.enable();
        }
        if (this._restoreDirectionalAnimation) {
            this.creatureBody.directionalAnimation.enable();
        }
        this.creatureBody.horizontalRotationEnabled = this._horizontalRotationEnabled;
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
        if (this.creatureBody.isFalling() && this.name !== "airborne") {
            this.endWithEvent("airborne");
        }
    }

    /**
     * When the Creature has landed on ground.
     */
    private _handleLandingEvent(event: IPhysicsCollisionEvent) {
        if (!this.isActive) return;
        this._landed = true;
    }
}