import { AnimationGroup } from "@babylonjs/core";
import IOwningState from "../../../../components/computation/pub/IOwningState";
import EventEmitter from "../../../../components/events/pub/EventEmitter";
import TStateResource from "./TStateResource";
import OwningState from "../../../computation/pub/OwningState";

/**
 * State for a creature where they are idle.
 */
export default class IdleState extends OwningState<TStateResource> {
    wantedResources: Set<TStateResource> = new Set(["animation"]);

    constructor(
        public idleAnimation: AnimationGroup,
    ) {
        super();
    }

    give(resources: Set<TStateResource>): Set<TStateResource> {
        if (resources.has("animation")) {
            this.idleAnimation.play(true);
        }

        return super.give(resources);
    }

    take(resources: Set<TStateResource>): Set<TStateResource> {
        const takenResources = super.take(resources);

        if (resources.has("animation")) {
            this.idleAnimation.stop();
        }

        return takenResources;
    }
}