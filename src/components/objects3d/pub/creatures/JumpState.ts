import { AnimationGroup, PhysicsAggregate, Vector3 } from "@babylonjs/core";
import TStateResource from "./TStateResource";
import OwningState from "../../../computation/pub/OwningState";
import IKeyableState from "./IKeyableState";
import Jumpable from "./Jumpable";
import Movable from "../Movable";
import IActionableState from "./IActionableState";

/**
 * State of a creature where the creature is jumping.
 */
export default class JumpState extends OwningState<TStateResource> implements IKeyableState, IActionableState {
    wantedResources: Set<TStateResource> = new Set(["animation", "mainAction"]);
    jumpable: Jumpable;

    constructor(
        public movable: Movable,
        public jumpAnimation: AnimationGroup
    ) {
        super();
        jumpAnimation.enableBlending = true;
        jumpAnimation.blendingSpeed = 0.2;
        this.jumpable = new Jumpable(movable);
        this.jumpable.emitter.on("jumpEnd", () => {
            if (this.isActive) {
                console.log("ended jumping");
                this._endSelf("run");
            }
        });
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
            this.jumpable.doOnTick(time);
        }
    }

    jump(): JumpState {
        if (this.isActive) {
            this.jumpAnimation.speedRatio = 0.6;
            this.jumpAnimation.play();
            this.jumpAnimation.goToFrame(50);
            this.jumpable.jump();
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
        
        if (resources.has("animation")) {
            
        }

        return givenResources;
    }

    take(resources: Set<TStateResource>): Set<TStateResource> {
        const takenResources = super.take(resources);

        if (takenResources.has("animation")) {
            this.jumpAnimation.stop();
        }

        return takenResources;
    }
}