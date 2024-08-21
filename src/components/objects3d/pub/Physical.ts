import { AbstractMesh, IPhysicsCollisionEvent, Mesh, MeshBuilder, Observer, PhysicsAggregate, PhysicsShapeType, TransformNode, Vector3 } from "@babylonjs/core";

export interface HitboxInfo {
    width: number;
    height: number;
    depth: number;
    position: Vector3;
    absolutePosition: Vector3;
    minBound: Vector3;
    maxBound: Vector3;
}

/**
 * An object with physics.
 */
export default class Physical {
    physicsAggregate: PhysicsAggregate;
    transformNode: Mesh;
    hitboxSize: {width: number, height: number, depth: number};
    terminalVelocity: number = -9.8;
    enabled: boolean = true;
    private _collisionObservers: Observer<IPhysicsCollisionEvent>[] = [];

    constructor(
        public wrappable: AbstractMesh,
        public mass: number,
        hitboxSize?: {width: number, height: number, depth: number}
    ) {
        // Calculate the size for the box wrapper.
        if (hitboxSize === undefined) {
            const boundingPoints = wrappable.getHierarchyBoundingVectors();
            const width = boundingPoints.max.x - boundingPoints.min.x;
            const height = boundingPoints.max.y - boundingPoints.min.y;
            const depth = boundingPoints.max.z - boundingPoints.min.z;
            hitboxSize = {
                width,
                height,
                depth
            };
        }
        this.hitboxSize = hitboxSize;
        // wrappable.position.y = wrappable.position.y - height/2;

        // Create box wrapper for the given mesh.
        // This is so that physics behaves well 
        // for meshes of all shapes.
        this.transformNode = MeshBuilder.CreateBox(
            `Physical:transformNode?${wrappable.id}`, 
            hitboxSize,
            wrappable.getScene()
        );
        
        // Hide the box wrapper.
        this.transformNode.visibility = 0;

        this.transformNode.setAbsolutePosition(wrappable.absolutePosition.clone());
        this.transformNode.addChild(wrappable);
        wrappable.setParent(this.transformNode);

        this.physicsAggregate = new PhysicsAggregate(
            this.transformNode, 
            PhysicsShapeType.BOX, 
            { mass: mass, friction: 0 }, 
            wrappable.getScene()
        );
    }

    /**
     * Information about the hitbox of the Physical.
     */
    hitboxInfo(): HitboxInfo {
        const bounds = this.transformNode.getHierarchyBoundingVectors();
        return {
            width: this.hitboxSize.width,
            height: this.hitboxSize.height,
            depth: this.hitboxSize.depth,
            position: this.transformNode.position,
            absolutePosition: this.transformNode.absolutePosition,
            minBound: bounds.min,
            maxBound: bounds.max
        };
    }

    /**
     * Whether the physics body is currently falling downwards 
     * at terminal velocity due to gravity.
     */
    isInTerminalFreefall() {
        return this.physicsAggregate.body.getLinearVelocity().y < this.terminalVelocity;
    }

    /**
     * Convenience method for setting the y-component of the physics body's linear velocity.
     */
    setVerticalVelocity(y: number) {
        // Note: velocity is a copy not a reference.
        const velocity = this.physicsAggregate.body.getLinearVelocity();
        velocity.y = y;
        this.physicsAggregate.body.setLinearVelocity(velocity);
    }

    /**
     * Disables physics for the object. Note: this will 
     * result in the current PhysicsAggregate being disposed.
     */
    disable() {
        if (!this.enabled) return;
        this.enabled = false;
        this._collisionObservers = [...this.physicsAggregate.body.getCollisionObservable().observers];
        this.physicsAggregate.dispose();
    }

    /**
     * Enables physics for the object if they had been disabled.
     * Note: this will result in the creation of a new PhysicsAggregate.
     */
    enable() {
        if (this.enabled) return;
        this.enabled = true;
        this.physicsAggregate = new PhysicsAggregate(
            this.transformNode, 
            PhysicsShapeType.BOX, 
            { mass: this.mass, friction: 0 }, 
            this.wrappable.getScene()
        );
        this._collisionObservers.forEach((observer) => {
            this.physicsAggregate.body.getCollisionObservable().add(
                observer.callback, observer.mask, false,
                observer.scope, observer.unregisterOnNextCall);
        });
    }
}