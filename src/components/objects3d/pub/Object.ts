import { AbstractMesh, IPhysicsCollisionEvent, Observable, PhysicsAggregate, Quaternion, TransformNode, Vector2, Vector3 } from "@babylonjs/core";
import IObject from "./IObject";
import Physical from "./Physical";
import EventEmitter from "../../events/pub/EventEmitter";

/**
 * An Object is a Mesh with physics together 
 * with animations that can be relevant for an arbitrary
 * object in the 3D environment of a game-like simulation. 
 * As opposed to a PhysicsAggregate, an Object can 
 * contain crude and unrealistic features that can still be useful 
 * in game-like simulations. Object can also contain 
 * helpful methods that neither Mesh nor PhysicsAggregate provide 
 * in babylonjs.
 */
export default class Object implements IObject {
    transformNode: TransformNode;
    landingLedgeBuffer: number = 0.3;
    asPhysical: Physical;
    emitter: EventEmitter = new EventEmitter();
    isInAir: boolean = false;
    inAirDirection: 1 | -1;
    lastUpdatedPosition: Vector3;
    preventBounceOnLanding: boolean = true;
    lastBumpPosition: Vector3 = new Vector3(0, 0, 0);
    lastBumpTime: number = 0;
    lastLandingTime: number = 0;
    eventTimeWindow: number = 50;
    protected _collisionObservable: Observable<IPhysicsCollisionEvent>;

    constructor(wrappee: AbstractMesh | Physical) {
        if (wrappee instanceof TransformNode) {
            this.asPhysical = new Physical(wrappee, 1);
        } else {
            this.asPhysical = wrappee;
        }

        this.transformNode = this.asPhysical.transformNode;
        this.lastUpdatedPosition = this.transformNode.position.clone();

        this._collisionObservable = this.asPhysical.physicsAggregate
            .body.getCollisionObservable();
        this._collisionObservable.add(this._handleCollisionEvent.bind(this));
    }

    /**
     * 3D Vector pointing in the direction the object is 
     * facing.
     */
    facedDirection() {
        return this.transformNode.getDirection(Vector3.Forward());
    }

    facedHorizontalDirection() {
        const direction = this.facedDirection();
        return new Vector2(direction.x, direction.z);
    }

    /**
     * The rotation angle of the object along the horizontal plane formed 
     * by its forward and left axis vectors.
     */
    horizontalAngle() {
        const eulerAngles = this.transformNode.rotationQuaternion.toEulerAngles();
        return eulerAngles.y;
    }

    /**
     * Sets the rotation of the object along the horizontal plane formed 
     * by its forward and left axis vectors.
     */
    setHorizontalAngle(angle: number) {
        const eulerAngles = this.transformNode.rotationQuaternion.toEulerAngles();
        eulerAngles.y = angle;
        this.transformNode.rotationQuaternion = Quaternion.FromEulerAngles(
            eulerAngles.x, eulerAngles.y, eulerAngles.z);
    }

    /**
     * When the object has collided with a ground object 
     * after being in the air. Listens to the "land" event.
     */
    onLanding(callback: (event: IPhysicsCollisionEvent) => void) {
        this.emitter.on("land", callback);
    }

    /**
     * When the object has collided with a non-ground 
     * object. Listens to the "bump" event.
     */
    onBump(callback: (event: IPhysicsCollisionEvent) => void) {
        this.emitter.on("bump", callback);
    }

    /**
     * When the object has become detached from a ground.
     * Listens to the "airborne" event.
     */
    onAirborne(callback: () => void) {
        this.emitter.on("airborne", callback);
    }

    /**
     * When the physics body of the Object has 
     * collided with another physics body.
     */
    protected _handleCollisionEvent(event: IPhysicsCollisionEvent) {
        const myBounds = this.transformNode.getHierarchyBoundingVectors(false);
        const otherBounds = event.collidedAgainst
            .transformNode.getHierarchyBoundingVectors(false);
        const timeNow = Date.now();

        if (this.isInAir) {
            if (myBounds.min.y >= otherBounds.max.y && this.isFalling()) {
                // If we have bumped recently.
                // We check this to avoid annoying unnecessary edge landing corrections 
                // when the not trying to wall jump. This whole correction process here 
                // is meant to prevent the ability to wall jump using small ledges on a wall.
                /* if (timeNow - this.lastBumpTime < this.eventTimeWindow) {
                    // Whether the object has landed on some kind of ledge.
                    const isOnFrontLedge = (myBounds.max.z > otherBounds.min.z && 
                        myBounds.min.z < otherBounds.min.z);
                    const isOnBackLedge = (myBounds.min.z < otherBounds.max.z && 
                        myBounds.max.z > otherBounds.max.z);
                    const isOnRightLedge = (myBounds.max.x > otherBounds.min.x && 
                        myBounds.min.x < otherBounds.min.x);
                    const isOnLeftLedge = (myBounds.min.x < otherBounds.max.x && 
                        myBounds.max.x > otherBounds.max.x);

                    // If the object is on a ledge that is too small
                    // to land on, we want to shift the object off of it.
                    let correctedOverlap = false;
                    if (isOnFrontLedge) {
                        correctedOverlap = this._correctLedgeOverlap(myBounds.max,
                            otherBounds.min, "z")
                    };
                    if (isOnBackLedge) {
                        correctedOverlap = this._correctLedgeOverlap(myBounds.min,
                            otherBounds.max, "z")
                    };
                    if (isOnRightLedge) {
                        correctedOverlap = this._correctLedgeOverlap(myBounds.min,
                            otherBounds.max, "x")
                    };
                    if (isOnLeftLedge) {
                        correctedOverlap = this._correctLedgeOverlap(myBounds.max,
                            otherBounds.min, "x")
                    };

                    // If we are on a ledge that is too small to land on,
                    // we do not count that as a landing.
                    if (correctedOverlap) return;
                } */

                if (this.preventBounceOnLanding) {
                    this.asPhysical.setVerticalVelocity(0);
                }
                this.isInAir = false;
                this.lastLandingTime = timeNow;
                console.log("land");
                this.emitter.trigger("land", [event]);
            } else {
                this.lastBumpTime = timeNow;
                if (this.isFalling()) {
                    this.transformNode.setAbsolutePosition(
                        this.transformNode.absolutePosition.subtract(event.normal.scale(0.05))
                    );
                }
                this.emitter.trigger("bump", [event]);
            }
        }
    }

    /**
     * Shorter convenience method for retrieving 
     * the physics body of the Object. 
     */
    physicsBody() {
        return this.asPhysical.physicsAggregate.body;
    }

    /**
     * Update the object based on the passage of time.
     */
    doOnTick(passedTime: number, absoluteTime: number) {
        if (Math.abs(this.transformNode.position.y - this.lastUpdatedPosition.y) > 0.05) {
            this.isInAir = true;
            this.inAirDirection = Math.sign(
                this.transformNode.position.y - this.lastUpdatedPosition.y) as 1 | -1;
            this.lastUpdatedPosition = this.transformNode.position.clone();
            this.emitter.trigger("airborne");
        }
    }

    /**
     * Whether the object is in air and is moving down vertically.
     */
    isFalling() {
        return this.inAirDirection < 0;
    }

    /**
     * If the object is on a ledge that is too small 
     * to land on, this method will correct the object's positioning 
     * so that it will not land on the ledge.
     */
    private _correctLedgeOverlap(myBoundVec: Vector3, 
        otherBoundVec: Vector3, coord: "x" | "z") {
        const ledgeOverlap = myBoundVec[coord] - otherBoundVec[coord];
        if (Math.abs(ledgeOverlap) < this.landingLedgeBuffer) {
            this.transformNode.absolutePosition[coord] -= this.landingLedgeBuffer;
            this.transformNode.setAbsolutePosition(
                this.transformNode.absolutePosition);
            return true;
        }
        return false;
    }
}