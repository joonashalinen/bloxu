import { AbstractMesh, IPhysicsCollisionEvent, Mesh, Observable, PhysicsAggregate, Quaternion, TransformNode, Vector2, Vector3 } from "@babylonjs/core";
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
    landingLedgeBuffer: number = 0.3;
    asPhysical: Physical;
    emitter: EventEmitter = new EventEmitter();
    isInVoid: boolean = false;
    isInAir: boolean = false;
    inAirDirection: 1 | -1;
    lastUpdatedPosition: Vector3;
    preventBounceOnLanding: boolean = true;
    lastBumpPosition: Vector3 = new Vector3(0, 0, 0);
    lastBumpTime: number = 0;
    lastLandingTime: number = 0;
    eventTimeWindow: number = 50;
    horizontalRotationEnabled = true;
    history: History<Object> = new History();
    useHistory: boolean = false;
    triggerChangeStateEvents: boolean = false;
    saveToHistoryPredicate: TSaveToHistoryPredicate = () => false;

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
     * When the physics body of the Object has 
     * collided with another physics body.
     */
    protected _handleCollisionEvent(event: IPhysicsCollisionEvent) {
        const timeNow = Date.now();

        if (this.isInAir) {
            if (event.normal.y < 0 && this.isFalling()) {
                if (this.preventBounceOnLanding) {
                    this.asPhysical.setVerticalVelocity(0);
                }
                this.isInAir = false;
                this.lastLandingTime = timeNow;
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

        this.emitter.trigger("collision", [event]);
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
     * Makes the object disappear from the world but 
     * the object can still be brought back by calling 
     * .bringBackFromTheVoid().
     */
    teleportToVoid() {
        if (this.isInVoid) return;

        this.changeState("teleportToVoid", [],
            () => {
                this.isInVoid = true;
                this.transformNode.setEnabled(false);
                this.asPhysical.disable();
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
                this.isInVoid = false;
                this.transformNode.setEnabled(true);
                this.asPhysical.enable();
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
                this.history.perform(new Action<Object>(this, performer, this._asUndo(undoer)));
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
        const originalPosition = this.transformNode.absolutePosition.clone();
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

    handleObjectCollision(object: Object) {
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
}