import { AnimationGroup, PhysicsAggregate, Vector3 } from "@babylonjs/core";
import TStateResource from "./TStateResource";
import OwningState from "../../../computation/pub/OwningState";
import IKeyableState from "./IKeyableState";
import Jumpable from "./Jumpable";
import Movable from "../Movable";
import IActionableState from "./IActionableState";
import IMovable from "../IMovable";
import IMovableState from "./IMovableState";

/**
 * State of a creature where the creature is jumping.
 */
export default class JumpState 
    extends OwningState<TStateResource> 
    implements IKeyableState, IActionableState, IMovableState 
{
    wantedResources: Set<TStateResource> = new Set(["animation", "mainAction", "movement"]);
    jumpable: Jumpable;

    constructor(
        public movable: Movable,
        public topMovable: IMovable,
        public jumpAnimation: AnimationGroup
    ) {
        super();
        jumpAnimation.enableBlending = true;
        jumpAnimation.blendingSpeed = 0.2;
        this.jumpable = new Jumpable(movable);
        this.jumpable.emitter.on("jumpEnd", () => {
            if (this.isActive) {
                console.log("ended jumping");
                this._endJumpState();
            }
        });
    }

    move(direction: Vector3): IMovableState {
        if (this.isActive) {
            this.topMovable.move(direction);
        }
        return this;
    }

    /**
     * We want to capture the main action 
     * to prevent other states from using it.
     */
    doMainAction(): IActionableState {
        // Do nothing.
        return this;
    }

    doOnTick(time: number) {
        if (this.isActive) {
            this.movable.doOnTick(time);
            this.jumpable.doOnTick(time);
        }
    }

    jump(): JumpState {
        if (this.isActive) {
            // If we are not already jumping.
            if (!this.jumpable.jumping) {
                // If the character is in air, we cannot jump 
                // and we must return from the jumping state.
                if (this.movable.isInAir) {
                    this._endJumpState();
                } else {
                    // The character is not in air, meaning
                    // we can jump.
                    this.jumpAnimation.speedRatio = 0.6;
                    this.jumpAnimation.play();
                    this.jumpAnimation.goToFrame(50);
                    this.jumpable.jump();
                }
            }
        }
        return this;
    }

    pressFeatureKey(key: string): IKeyableState {
        if (this.isActive) {
            if (key === " ") {
                this.jump();
            }
        }
        return this;
    }

    releaseFeatureKey(key: string): IKeyableState {
        return this;
    }
    
    give(resources: Set<TStateResource>): Set<TStateResource> {
        const givenResources = super.give(resources);
        return givenResources;
    }

    take(resources: Set<TStateResource>): Set<TStateResource> {
        const takenResources = super.take(resources);

        if (takenResources.has("animation")) {
            this.jumpAnimation.stop();
        }

        if (takenResources.has("movement")) {
            this.topMovable.move(new Vector3(0, 0, 0));
        }

        return takenResources;
    }

    /**
     * End the JumpState from within.
     */
    private _endJumpState() {
        if (this.isActive) {
            const nextState = !(this.movable.direction.equals(new Vector3(0, 0, 0))) ? "run" : "idle";
            super._endSelf(nextState);
        }
    }
}