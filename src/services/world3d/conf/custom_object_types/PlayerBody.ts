import { GlowLayer, Mesh, MeshBuilder, PhysicsAggregate, PhysicsBody, PhysicsShape, PhysicsShapeType, Scene, TransformNode, Vector2, Vector3 } from "@babylonjs/core";
import Movable from "../../../../components/objects3d/pub/Movable";
import Pointer from "../../../../components/objects3d/pub/Pointer";
import Follower from "../../../../components/objects3d/pub/Follower";
import Glow from "../../../../components/graphics3d/pub/effects/Glow";
import DPlayerBody from "./DPlayerBody";
import MouseRotatable from "../../../../components/objects3d/pub/MouseRotatable";
import MeshLeash2D from "../../../../components/graphics3d/pub/MeshLeash2D";

/**
 * The body that the Player service owns and controls.
 */
export default class PlayerBody {
    mainMesh: Mesh;
    mainMeshRotatable: MouseRotatable;
    physicsAggregate: PhysicsAggregate;
    movable: Movable;

    arrowMesh: Mesh;
    arrowPointer: Pointer;
    arrowFollower: Follower;
    arrowMeshRotatable: MouseRotatable;
    
    ballMovable: Movable;
    ballGlow: Glow;
    glowLayer: GlowLayer;

    constructor(
        public id: string, 
        public startingPosition: Vector3, 
        public scene: Scene,
        public meshConstructors: {
            "DirectionArrow": (id: string) => Mesh
        }
    ) {
        this.startingPosition = startingPosition;
        
        // Create the mesh group for the player character that
        //  is used for attaching other meshes to it.
        // For example, the aiming arrow shown when shooting is attached 
        // to the same group later so that it follows the player character.
        // this.meshGroup = new TransformNode(`PlayerBody:meshGroup?${this.id}`);

        // Create the player character mesh, which 
        // is currently just a box.
        this.mainMesh = MeshBuilder.CreateBox(`PlayerBody:mainMesh?${this.id}`, {size: 0.7}, this.scene);
        this.mainMesh.position.set(startingPosition.x, startingPosition.y, startingPosition.z);

        // Add physics to the player character. We 
        // want physics enabled for collision detection.
        this.physicsAggregate = new PhysicsAggregate(
            this.mainMesh, 
            PhysicsShapeType.BOX, 
            { mass: 0.1 }, 
            this.scene
        );
        // We need to set this so that we can rotate the mesh afterwards.
        this.physicsAggregate.body.disablePreStep = false;

        // Make a Movable object from the player character so 
        // that we can move it.
        this.movable = new Movable(this.physicsAggregate);

        // Create mesh of pointer arrow shown when aiming that is attached to the player character.
        this.arrowMesh = this.meshConstructors.DirectionArrow(`PlayerBody:arrowMesh?${this.id}`);
         
        // Scale the mesh, since the model is too big by default.
        this.arrowMesh.scaling = this.arrowMesh.scaling.multiplyByFloats(0.5, 0.5, 0.5);

        // Shift the arrow so that its tail starts from the player mesh.
        const maxBound = this.arrowMesh.getHierarchyBoundingVectors().max;
        this.arrowMesh.position.x = maxBound.x * (-1);
        this.arrowMesh.position.y = this.mainMesh.getBoundingInfo().minimum.y;
        
        // Create a Pointer object with the arrow mesh. The Pointer 
        // object is used for rotating the arrow around the player mesh.
        this.arrowPointer = new Pointer(this.arrowMesh, this.mainMesh);
        
        // Make a MouseRotatable object from the main character mesh 
        // so that it rotates along with the mouse pointer such that 
        // it always points at it.
        this.mainMeshRotatable = new MouseRotatable(this.physicsAggregate.transformNode);
        
        // Make a MouseRotatable from the arrow pointer mesh 
        // so that it follows the mouse pointer.
        this.arrowMeshRotatable = new MouseRotatable(this.arrowPointer.centerOfRotation);

        // Make the arrow follow the position of the player character.
        this.arrowFollower = new Follower(this.arrowPointer.centerOfRotation, this.movable);

        // Create glow layer for the glow effect of the plasma ball.
        this.glowLayer = new GlowLayer(`PlayerBody:glowLayer?${this.id}`, scene);
    }

    /**
     * Update player's body for the current render iteration.
     */
    doOnTick(time: number) {
        this.movable.doOnTick(time);
        this.arrowFollower.doOnTick(time);
        if (this.ballMovable !== undefined) {
            this.ballMovable.doOnTick(time);
        }
    }

    /**
     * Shoot in the given direction. The direction is a 2D 
     * vector where the y-component corresponds 
     * with the z-coordinate in world space.
     */
    shoot(direction: Vector2) {
        // Apply needed transformations to make the ball shoot out correctly.
        // These values were found by manual testing and a more in-depth 
        // exploration of why this is needed should be done.
        const transformedDirection = new Vector3(direction.x * (-1), 0, direction.y);
        // Create ball mesh.
        const ball = MeshBuilder.CreateSphere(`PlayerBody:ball?${this.id}`, {diameter: 0.3}, this.scene);
        // Position the ball in front of the player character.
        const normalizedDirection = transformedDirection.normalize();
        ball.position = this.mainMesh.position.add(
            new Vector3(normalizedDirection.x, 0, normalizedDirection.y)
        );
        // Add glow effect to ball.
        this.ballGlow = new Glow(this.glowLayer, this.scene);
        this.ballGlow.apply(ball);
        // Enable physics for ball.
        const physicsAggregate = new PhysicsAggregate(
            ball, 
            PhysicsShapeType.SPHERE, 
            { mass: 0.1 }, 
            this.scene
        );
        // Make the ball movable and set its course of motion.
        this.ballMovable = new Movable(physicsAggregate);
        this.ballMovable.speed = 80;
        this.ballMovable.move(transformedDirection);
    }

    /**
     * Returns the state of the PlayerBody as 
     * a data object.
     */
    state(): DPlayerBody {
        const position = this.physicsAggregate.transformNode.position;
        return {
            position: {
                x: position.x,
                y: position.y,
                z: position.z
            }
        };
    }

    /**
     * Sets the inner state of the PlayerBody to reflect 
     * the state represented in the given data object.
     */
    setState(state: DPlayerBody) {
        const pos = state.position;
        this.physicsAggregate.transformNode.position.set(pos.x, pos.y, pos.z);
    }

    /**
     * Enable PlayerBody to automatically keep 
     * its objects updated.
     */
    enableAutoUpdate() {
        this.arrowMeshRotatable.enableAutoUpdate();
        this.mainMeshRotatable.enableAutoUpdate();
    }
}