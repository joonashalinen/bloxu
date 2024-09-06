import { AbstractMesh, Animation, BezierCurveEase, IPhysicsCollisionEvent, Mesh, Observable, PhysicsAggregate, Quaternion, TransformNode, Vector2, Vector3 } from "@babylonjs/core";
import Physical from "./Physical";
import EventEmitter from "../../events/pub/EventEmitter";
import History from "../../data_structures/pub/History";
import Action from "../../computation/pub/Action";

export type TSaveToHistoryPredicate = (method: string, args: unknown[], self: Object) => boolean;

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
export default class Object {
    id: string = "";
    ownerId: string;
    transformNode: TransformNode;
    asPhysical: Physical;
    emitter: EventEmitter = new EventEmitter();
    isInVoid: boolean = false;
    bringingBackFromTheVoid: boolean = false;
    isInAir: boolean = false;
    inAirDirection: 1 | -1;
    inAirDetectionThreshold: number = 0.01;
    lastUpdatedPosition: Vector3;
    preventBounceOnLanding: boolean = true;
    horizontalRotationEnabled = true;
    history: History<Object, Object> = new History();
    useHistory: boolean = false;
    triggerChangeStateEvents: boolean = false;
    saveToHistoryPredicate: TSaveToHistoryPredicate = () => false;
    createTeleportInAnimation: () => Animation = this._defaultTeleportInAnimation.bind(this);
    createTeleportOutAnimation: () => Animation = this._defaultTeleportOutAnimation.bind(this);
    teleportAnimationSpeed = 2;
    landingTimeoutDuration: number = 100;
    useTimeoutLandingDetection: boolean = false;
    canLand: (event: IPhysicsCollisionEvent) => boolean = () => true;
    rectifyFalseLanding: (event: IPhysicsCollisionEvent) => void = () => {};
    isLocked: boolean = false;
    private _lastPositionUpdateTime: number = 0;
    private _isHidden: boolean = false;
    private _runningId: number = 0;
    private _meshVisibilities: Map<AbstractMesh, number> = new Map();
    private _bringingBackFromTheVoidCounter: number = 0;

    constructor(wrappee: AbstractMesh | Physical) {
        if (wrappee instanceof TransformNode) {
            this.asPhysical = new Physical(wrappee, 0);
        } else {
            this.asPhysical = wrappee;
        }

        this.history = new History();
        this.transformNode = this.asPhysical.transformNode;
        this.lastUpdatedPosition = this.transformNode.position.clone();

        this.asPhysical.physicsAggregate.body.getCollisionObservable()
            .add(this._handleCollisionEvent.bind(this));
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
        if (!this.horizontalRotationEnabled) return;
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
     * Causes the object to perform state changes event triggers
     * associated with landing, if the object is in air.
     */
    land() {
        if (this.preventBounceOnLanding) {
            this.asPhysical.setVerticalVelocity(0);
        }
        this.isInAir = false;
        this.emitter.trigger("land", [event]);
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
        if (this.isInVoid) return;
        if (Math.abs(this.transformNode.getAbsolutePosition().y - this.lastUpdatedPosition.y) >
            this.inAirDetectionThreshold) {
                
            this.isInAir = true;
            this.inAirDirection = Math.sign(
                this.transformNode.position.y - this.lastUpdatedPosition.y) as 1 | -1;
            this.lastUpdatedPosition = this.transformNode.getAbsolutePosition().clone();
            if (this.useTimeoutLandingDetection) this._lastPositionUpdateTime = Date.now();
            this.emitter.trigger("airborne");

        } else if (this.useTimeoutLandingDetection && this.isInAir &&
            (Date.now() - this._lastPositionUpdateTime > this.landingTimeoutDuration)) {
            // As a final fallback, if the object is in air but has not had a position update (i.e. no 
            // vertical movement has been detected) for the set timeout duration, we conclude
            // the object has landed. In some cases the object is able to land without a collision event 
            // being triggered by babylonjs for some reason. This fallback fixes these edge cases.
            this.land();
        }
    }

    /**
     * Whether the object is in air and is moving down vertically.
     */
    isFalling() {
        return this.isInAir && this.inAirDirection < 0;
    }

    /**
     * Makes the object disappear from the world but 
     * the object can still be brought back by calling 
     * .bringBackFromTheVoid().
     */
    teleportToVoid() {
        if (this.isInVoid) return;

        this.changeState("teleportToVoid", [],
            () => {
                this.isInVoid = true;
                this._playTeleportAnimation(this.createTeleportOutAnimation);
                this.asPhysical.disable();
                this.hide();
            }, this.bringBackFromTheVoid);
    }

    /**
     * Makes the object reappear into the 
     * world if it had been disappeared by 
     * calling .teleportToVoid().
     */
    bringBackFromTheVoid() {
        if (!this.isInVoid) return;

        this.changeState("bringBackFromTheVoid", [],
            () => {
                this.bringingBackFromTheVoid = true;
                this._bringingBackFromTheVoidCounter++;
                this.isInVoid = false;
                this.asPhysical.enable();
                this._playTeleportAnimation(this.createTeleportInAnimation).then(() => {
                    // If the object hasn't been sent to the void while the animation was playing,
                    // we can now make it visible. If we made the object visible before 
                    // waiting for the animation to end, it would most likely interfere with the
                    // teleport-in animation. For example, the default teleport-in animation
                    // enlarges the object from zero to its full size.
                    if (!this.isInVoid) this.show();
                    this._bringingBackFromTheVoidCounter--;
                    if (this._bringingBackFromTheVoidCounter === 0) {
                        this.bringingBackFromTheVoid = false;
                    }
                });
            }, this.teleportToVoid);
    }

    /**
     * Returns the base mesh of the Object, which is different 
     * than the .transformNode that was made when the 
     * Object was made Physical.
     */
    rootMesh(): Mesh {
        return this.transformNode.getChildMeshes().at(0) as Mesh;
    }

    /**
     * Performs an action on the object that changes 
     * the state of the object and can be undone.
     */
    changeState(actionName: string, actionArgs: unknown[],
        performer: (object: Object) => void,
        undoer: (object: Object) => void) {
        
        if (this.useHistory) {
            if (this.saveToHistoryPredicate(actionName, actionArgs, this)) {
                this.history.perform(new Action(this, this, performer, this._asUndo(undoer)));
            }
        } else {
            performer(this);
        }

        if (this.triggerChangeStateEvents) {
            this.emitter.trigger("changeState", [actionName, ...actionArgs]);
        }
    }

    /**
     * Sets the absolute position of the object in the world 
     * to the given position, also moving the mesh.
     */
    setAbsolutePosition(position: Vector3) {
        const originalPosition = this.transformNode.getAbsolutePosition().clone();
        this.changeState("setAbsolutePosition", [position],
            () => {
                this.transformNode.setAbsolutePosition(position);
            }, () => {
                this.transformNode.setAbsolutePosition(originalPosition);
        });
    }

    /**
     * Listen to collisions on the physics body.
     */
    onCollision(callback: (event: IPhysicsCollisionEvent) => void) {
        this.emitter.on("collision", callback);
    }

    offCollision(callback: (event: IPhysicsCollisionEvent) => void) {
        this.emitter.off("collision", callback);
    }

    handleObjectCollision(object: Object, event: IPhysicsCollisionEvent) {
        if (event.collider !== this.asPhysical.physicsAggregate.body) {
            // Sometimes babylonjs will give the collision event to the other physics body
            // if the other body is in motion as well. So we have to check whether we have 
            // landed on such a body because we will not get the collision event 
            // through our own physics body's collision observable.
            if (this.isInAir && event.normal.y > 0 && this.canLand(event)) {
                this.land();
            }
        }
    }

    /**
     * Listen to 'changeState' events, which are triggered when the 
     * object has a state changing method is called (excluding .doOnTick and event handlers),
     * assuming .triggerChangeStateEvents is set to true.
     */
    onChangeState(callback: (method: string, ...methodArgs: unknown[]) => void) {
        this.emitter.on("changeState", callback);
    }

    offChangeState(callback: (method: string, ...methodArgs: unknown[]) => void) {
        this.emitter.off("changeState", callback);
    }

    /**
     * Changes ownership of the object to the given owner.
     */
    changeOwnership(newOwnerId: string) {
        const oldOwnerId = this.ownerId;
        if (oldOwnerId === newOwnerId) return;
        this.changeState("changeOwnership", [newOwnerId],
            () => {
                this.ownerId = newOwnerId;
            }, () => {
                this.ownerId = oldOwnerId;
        });
    }

    /**
     * Makes the object visible again if it was previously made invisible.
     */
    show() {
        if (!this._isHidden) return;

        this.transformNode.getChildMeshes().forEach((mesh) => {
            if (this._meshVisibilities.has(mesh)) {
                mesh.visibility = this._meshVisibilities.get(mesh);
            }
        });
        this._isHidden = false;
    }

    /**
     * Makes the object's meshes invisible. The object will still have physics
     * and collisions.
     */
    hide() {
        if (this._isHidden) return;

        this.transformNode.getChildMeshes().forEach((mesh) => {
            // Save the current visibility of the mesh so we can restore it later.
            this._meshVisibilities.set(mesh, mesh.visibility);
            // Hide the mesh.
            mesh.visibility = 0;
        });
        this._isHidden = true;
    }

    /**
     * Permanently destroys the Object and all its related meshes.
     */
    destroy() {
        this.transformNode.getScene().removeMesh(this.transformNode as Mesh);
        this.transformNode.setEnabled(false);
        this.asPhysical.physicsAggregate.dispose();
        this.transformNode.dispose();
    }

    /**
     * When the physics body of the Object has 
     * collided with another physics body.
     */
    protected _handleCollisionEvent(event: IPhysicsCollisionEvent) {
        if (this.isInAir) {
            if (event.normal.y < 0) {
                if (this.canLand(event)) {
                    this.land();
                } else {
                    this.rectifyFalseLanding(event);
                }
            } else {
                if (this.isFalling()) {
                    
                }
                this.emitter.trigger("bump", [event]);
            }
        }
        this.emitter.trigger("collision", [event]);
    }

    /**
     * Returns the given lambda as a function that can be called 
     * to undo a state-changing operation done on the Object.
     * This is needed because otherwise we might add to the Object's 
     * history when undoing.
     */
    private _asUndo(f: (object: Object) => void) {
        return (object: Object) => {
            const originalPredicate = this.saveToHistoryPredicate;
            this.saveToHistoryPredicate = () => false;
            f(object);
            this.saveToHistoryPredicate = originalPredicate;
        };
    }

    /**
     * Default animation for when the object is teleportedout , such as when
     * .teleportToVoid is called.
     */
    private _defaultTeleportOutAnimation() {
        const teleportOutAnimation = new Animation(
            "Object:teleportOutAnimation" + (this._runningId++), "scaling", 60,
            Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CYCLE
        );
        teleportOutAnimation.setEasingFunction(new BezierCurveEase(0.58, 0.01, 0.48, 1.04));
        const currentScaling = this.rootMesh().scaling.clone();
        teleportOutAnimation.setKeys(
            [{frame: 0, value: currentScaling},
            {frame: 60, value: currentScaling.scale(0.00001)}]
        );
        return teleportOutAnimation;
    }

    /**
     * Default animation for when the object is teleported in, such as when
     * .bringBackFromTheVoid is called.
     */
    private _defaultTeleportInAnimation() {
        const teleportInAnimation = new Animation(
            "Object:teleportInAnimation" + (this._runningId++), "scaling", 60,
            Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CYCLE
        );
        teleportInAnimation.setEasingFunction(new BezierCurveEase(0.58, 0.01, 0.48, 1.04));
        const currentScaling = this.rootMesh().scaling.clone();
        teleportInAnimation.setKeys(
            [{frame: 0, value: currentScaling.scale(0.00001)},
            {frame: 60, value: currentScaling}]
        );
        return teleportInAnimation;
    }

    /**
     * Creates a clone of the root mesh and plays the given 
     * teleport animation for it. Returns a promise that resolves when 
     * the animation has ended.
     */
    private _playTeleportAnimation(createTeleportAnimation: () => Animation) {
        return new Promise<void>((resolve) => {
            const animationMeshParent = new TransformNode(
                "Object:animationMeshRoot?" + (this._runningId++), this.transformNode.getScene());
            
            const animationMesh = this.rootMesh().clone(
                "Object:animationMesh?" + this.rootMesh().name + (this._runningId++), animationMeshParent);
            animationMesh.setAbsolutePosition(this.transformNode.getAbsolutePosition().clone());
            animationMesh.rotationQuaternion = this.rootMesh().absoluteRotationQuaternion.clone();
            
            // If the object is hidden then all the cloned meshes are also hidden,
            // which means we should make them visible.
            if (this._isHidden) {
                // Make the cloned mesh itself visible.
                if (this._meshVisibilities.has(this.rootMesh())) {
                    animationMesh.visibility = this._meshVisibilities.get(this.rootMesh());
                }
                // Make the children of the cloned mesh visible.
                const rootChildMeshes = this.rootMesh().getChildMeshes();
                animationMesh.getChildMeshes().forEach((mesh, index) => {
                    if (this._meshVisibilities.has(rootChildMeshes.at(index))) {
                        mesh.visibility = rootChildMeshes.at(index).visibility;
                    }
                });
            }

            animationMesh.animations.push(createTeleportAnimation());
            animationMesh.getScene().beginAnimation(animationMesh, 0, 60, false,
                this.teleportAnimationSpeed, () => {
                    setTimeout(() => {
                        animationMesh.getScene().removeMesh(animationMesh as Mesh);
                    }, 100)
                    resolve();
                }
            );
        });
    }
}