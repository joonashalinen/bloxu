import { Mesh, MeshBuilder, PhysicsAggregate, PhysicsBody, PhysicsShape, PhysicsShapeType, Scene, TransformNode, Vector3 } from "@babylonjs/core";
import Movable from "../../../../components/objects3d/pub/Movable";
import Pointer from "../../../../components/objects3d/pub/Pointer";
import Follower from "../../../../components/objects3d/pub/Follower";

/**
 * The body that the Player service owns and controls.
 */
export default class PlayerBody {
    mainMesh: Mesh;
    physicsAggregate: PhysicsAggregate;
    movable: Movable;
    arrowMesh: Mesh;
    arrowPointer: Pointer;
    arrowFollower: Follower;

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
        // Attach the player mesh to the player mesh group.
        // this.mainMesh.parent = this.meshGroup;

        // Add physics to the player character. We 
        // want physics enabled for collision detection.
        this.physicsAggregate = new PhysicsAggregate(
            this.mainMesh, 
            PhysicsShapeType.BOX, 
            { mass: 0.1 }, 
            this.scene
        );

        // Make a Movable object from the player mesh group
        // so that we can move it.
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
        
        this.arrowFollower = new Follower(this.arrowPointer.centerOfRotation, this.movable);

        // Attach the arrow to the player mesh group so that 
        // it stays attached to the player mesh.
        // this.arrowPointer.centerOfRotation.parent = this.meshGroup;
    }

    /**
     * Update player's body for the current render iteration.
     */
    doOnTick(time: number) {
        this.movable.doOnTick(time);
        this.arrowFollower.doOnTick(time);
    }

}