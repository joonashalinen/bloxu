import { AbstractMesh, AnimationGroup, Mesh, TransformNode, Vector2, Vector3 } from "@babylonjs/core";
import Characterized from "../../classes/pub/Characterized";
import IObject from "./IObject";
import Movable from "./Movable";
import Physical from "./Physical";
import MouseRotatable from "./MouseRotatable";
import RelativeMovable from "./RelativeMovable";
import IMovable from "./IMovable";
import IRotatable from "./IRotatable";
import AnimatedMovable from "./AnimatedMovable";
import CompassPointMovable from "./CompassPointMovable";
import AntiRelativeMovable from "./AntiRelativeMovable";
import AnimatedRotatable from "./AnimatedRotatable";
import AnimatedMovableRotatable from "./AnimatedMovableRotatable";
import CameraRelativeMovable from "./CameraRelativeMovable";
import { isAutoUpdatable } from "./IAutoUpdatable";
import { isEventable } from "../../events/pub/IEventable";
import EventableMovable from "./EventableMovable";

/**
 * A builder for objects that can be controlled.
 */
export default class ControllableBuilder {
    result = new Characterized<IObject>();
    topMovable: IMovable & IObject;
    topRotatable: IRotatable & IObject;

    constructor(public topNode: AbstractMesh) {
    }

    /**
     * Make the object movable.
     */
    makeMovable(speed: number, hitboxSize: {width: number, height: number, depth: number}) {
        const physical = new Physical(this.topNode, 1, hitboxSize);
        const movable = new Movable(physical.physicsAggregate);
        movable.speed = speed;

        this.result.is(physical);
        this.result.is(movable);

        this.topNode = physical.transformNode;
        this.topMovable = movable;
        return this;
    }

    /**
     * Make the object automatically face the mouse cursor at all times (rotating around the y-axis).
     * If we wish to make the object physical at any point (for example by making it movable), 
     * we should do that first before calling this method.
     */
    makeMouseRotatable() {
        const rotatable = new MouseRotatable(this.topNode);
        // If the object has physics enabled.
        if (this.result.as("Physical") !== undefined) {
            // We need to set this so that we can rotate the mesh.
            (this.result.as("Physical") as Movable).physicsAggregate.body.disablePreStep = false;
        }
        this.result.is(rotatable);
        this.topRotatable = rotatable;
        return this;
    }

    /**
     * Add turning animations to the object.
     */
    makeAnimatedRotatable(
        animations: {left: AnimationGroup, right: AnimationGroup},
        restAnimation: AnimationGroup
    ) {
        if (this.topRotatable === undefined) {
            throw new Error("The object must first be a rotatable before it can become an AnimatedRotatable");
        } 

        if (!isAutoUpdatable(this.topRotatable)) {
            throw new Error("The latest created rotatable must be an IAutoUpdatable.");
        }

        const animatedRotatable = new AnimatedRotatable(this.topRotatable, animations);
        this.result.is(animatedRotatable);
        this.topRotatable = animatedRotatable;
        return this;
    }

    /**
     * Make the object (which is assumed to already be rotatable and movable with animations) 
     * disable rotation animations whenever the object moves.
     */
    makeAnimatedMovableRotatable() {
        if (this.result.as("Movable") === undefined) {
            throw new Error(
                "The object must first be a Movable before it can be made " + 
                "an AnimatedMovableRotatable"
            );
        }
        if (this.result.as("AnimatedRotatable") === undefined) {
            throw new Error(
                "The object must first be an AnimatedRotatable before it can be made " + 
                "an AnimatedMovableRotatable"
            );
        }

        const movable = this.result.as("EventableMovable") as EventableMovable;
        const animatedRotatable = this.result.as("AnimatedRotatable") as AnimatedRotatable;
        const animatedMovableRotatable = new AnimatedMovableRotatable(movable, animatedRotatable);
        
        this.result.is(animatedMovableRotatable);
        return this;
    }

    /**
     * Make the movable have events.
     */
    makeEventableMovable() {
        if (this.result.as("Movable") === undefined) {
            throw new Error(
                "The object must first be a Movable before it can be made " + 
                "an EventableMovable"
            );
        }

        const eventableMovable = new EventableMovable(this.topMovable);
        this.topMovable = eventableMovable;

        this.result.is(eventableMovable);
        return this;
    }

    /**
     * Make the object's movement controls relative to its rotation.
     */
    makeRelativeMovable() {
        if (
            this.topMovable === undefined,
            this.topRotatable === undefined
        ) {
            throw new Error(
                "The object to be built must be made movable and " + 
                "a rotatable before it can be made a RelativeMovable."
            );
        }

        const relativeMovable = new RelativeMovable(
            this.topMovable, 
            this.topRotatable
        );

        this.result.is(relativeMovable);
        this.topMovable = relativeMovable;
        return this;
    }

    /**
     * Add the opposite effect of RelativeMovable to the chain of movement direction 
     * transformations done when moving the object.
     */
    makeAntiRelativeMovable() {
        if (
            this.topMovable === undefined,
            this.topRotatable === undefined
        ) {
            throw new Error(
                "The object to be built must be made movable and " + 
                "a rotatable before it can be made a RelativeMovable."
            );
        }

        const relativeMovable = new AntiRelativeMovable(
            this.topMovable, 
            this.topRotatable
        );

        this.result.is(relativeMovable);
        this.topMovable = relativeMovable;
        return this;
    }

    /**
     * Make the object move in relation to the current camera orientation.
     */
    makeCameraRelativeMovable() {
        if (
            this.topMovable === undefined
        ) {
            throw new Error(
                "The object to be built must be made movable " + 
                "before it can be made a CameraRelativeMovable."
            );
        }

        const cameraRelativeMovable = new CameraRelativeMovable(
            this.topMovable, 
            this.topMovable.transformNode.getScene().activeCamera!
        );

        this.result.is(cameraRelativeMovable);
        this.topMovable = cameraRelativeMovable;
        return this;
    }

    /**
     * Make the object have animations that play 
     * during movements.
     */
    makeAnimatedMovable(
        directions: Vector2[], 
        animationGroups: AnimationGroup[],
        defaultAnimation: AnimationGroup
    ) {
        if (!(this.topMovable instanceof EventableMovable)) {
            throw new Error("The object must be made last an EventableMovable before it can be made an animated movable.");
        }

        const animatedMovable = new AnimatedMovable(this.topMovable as EventableMovable, directions, animationGroups);
        animatedMovable.currentAnimation = defaultAnimation;
        this.result.is(animatedMovable);
        this.topMovable = animatedMovable;

        return this;
    }

    /**
     * Make the object movable based on discrete compass point directions.
     */
    makeCompassPointMovable() {
        if (this.topMovable === undefined) {
            throw new Error("The object must be made a movable before it can be made an animated movable.");
        }

        const compassPointMovable = new CompassPointMovable(this.topMovable);
        
        // CompassPointMovable is not a real IMovable. Thus, we do not 
        // need to set this.topMovable.

        this.result.is(compassPointMovable);
        return this;
    }
}