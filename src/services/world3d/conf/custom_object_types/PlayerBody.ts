import { AbstractMesh, AnimationGroup, Axis, GlowLayer, Mesh, MeshBuilder, PhysicsAggregate, PhysicsBody, PhysicsMotionType, PhysicsShape, PhysicsShapeType, Quaternion, Scene, TransformNode, Vector2, Vector3 } from "@babylonjs/core";
import Movable from "../../../../components/objects3d/pub/Movable";
import Pointer from "../../../../components/objects3d/pub/Pointer";
import Follower from "../../../../components/objects3d/pub/Follower";
import Glow from "../../../../components/graphics3d/pub/effects/Glow";
import DPlayerBody from "./DPlayerBody";
import MouseRotatable from "../../../../components/objects3d/pub/MouseRotatable";
import MeshLeash2D from "../../../../components/graphics3d/pub/MeshLeash2D";
import CompassPointVector from "../../../../components/graphics3d/pub/CompassPointVector";
import TCompassPoint from "../../../../components/geometry/pub/TCompassPoint";
import EventEmitter from "../../../../components/events/pub/EventEmitter";
import Characterized from "../../../../components/classes/pub/Characterized";
import IObject from "../../../../components/objects3d/pub/IObject";
import CompassPointMovable from "../../../../components/objects3d/pub/CompassPointMovable";
import RelativeMovable from "../../../../components/objects3d/pub/RelativeMovable";
import AnimatedMovable from "../../../../components/objects3d/pub/AnimatedMovable";
import { ICharacterAnimations } from "../meshConstructors";

/**
 * The body that the Player service owns and controls.
 */
export default class PlayerBody {
    body: Characterized<IObject> = new Characterized();
    ui: Characterized<IObject> = new Characterized();

    mainMesh: Mesh;
    mainMeshRotatable: MouseRotatable;
    physicsAggregate: PhysicsAggregate;
    movable: CompassPointMovable;
    characterAnimations: ICharacterAnimations;

    arrowMesh: Mesh;
    arrowPointer: Pointer;
    arrowFollower: Follower;
    arrowMeshRotatable: MouseRotatable;
    
    ballMovable: Movable;
    ballGlow: Glow;
    glowLayer: GlowLayer;

    emitter = new EventEmitter();

    constructor(
        public id: string, 
        public startingPosition: Vector3, 
        public scene: Scene,
        public meshConstructors: {
            "DirectionArrow": (id: string) => Mesh,
            "Player": (id: string) => [Mesh, ICharacterAnimations]
        }
    ) {
        this.startingPosition = startingPosition;

        // Create the player character mesh.
        // We first create a box that acts as the wrapper for the player character mesh.
        // We want the box wrapper so that physics behaves well.
        this.mainMesh = MeshBuilder.CreateBox(`PlayerBody:mainMesh?${this.id}`, {size: 0.7}, this.scene);
        // Hide the box.
        this.mainMesh.visibility = 0;

        const [characterMesh, characterAnimations] = meshConstructors["Player"](`PlayerBody:characterMesh?${this.id}`);
        this.characterAnimations = characterAnimations;
        // Add the player character mesh to the box wrapper.
        this.mainMesh.addChild(characterMesh);
        // Position the character at the given starting position.
        this.mainMesh.position.set(startingPosition.x, startingPosition.y + 1, startingPosition.z);

        // Add physics to the player character. We 
        // want physics enabled for collision detection.
        this.physicsAggregate = new PhysicsAggregate(
            this.mainMesh, 
            PhysicsShapeType.BOX, 
            { mass: 1,  }, 
            this.scene
        );
        // this.physicsAggregate.body.setMotionType(PhysicsMotionType.ANIMATED);
        // We need to set this so that we can rotate the mesh afterwards.
        this.physicsAggregate.body.disablePreStep = false;
        // Enable collision callbacks so we can detect when the player gets hit 
        // by a projectile.
        this.physicsAggregate.body.setCollisionCallbackEnabled(true);
        this.physicsAggregate.body.setMassProperties({
            inertia: new Vector3(0, 0, 0)
        });

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
        
        const animatedMovable = new AnimatedMovable(
            new RelativeMovable(
                new Movable(this.physicsAggregate),
                this.mainMeshRotatable
            ),
            [
                new Vector2(0, 0),
                new Vector2(0, 1),
                (new Vector2(1, 1)).normalize(),
                new Vector2(1, 0),
                (new Vector2(1, -1)).normalize(),
                new Vector2(0, -1),
                (new Vector2(-1, -1)).normalize(),
                new Vector2(-1, 0),
                (new Vector2(-1, 1)).normalize(),
            ],
            [
                characterAnimations["idle"],
                characterAnimations["moveForward"],
                characterAnimations["moveForwardRight"],
                characterAnimations["moveRight"],
                characterAnimations["moveBackwardRight"],
                characterAnimations["moveBackward"],
                characterAnimations["moveBackwardLeft"],
                characterAnimations["moveLeft"],
                characterAnimations["moveForwardLeft"]
            ]
        );

        animatedMovable.currentAnimation = characterAnimations[0];

        // Make a movable object from the player character so 
        // that we can move it.
        this.movable = new CompassPointMovable(animatedMovable);

        (((this.movable.movable as AnimatedMovable).movable as RelativeMovable).movable as Movable).speed = 0.01;

        // Make a MouseRotatable from the arrow pointer mesh 
        // so that it follows the mouse pointer.
        this.arrowMeshRotatable = new MouseRotatable(this.arrowPointer.centerOfRotation);

        // Make the arrow follow the position of the player character.
        this.arrowFollower = new Follower(
            this.arrowPointer.centerOfRotation, 
            (((this.movable.movable as AnimatedMovable).movable as RelativeMovable).movable as Movable)
        );

        // Create glow layer for the glow effect of the plasma ball.
        this.glowLayer = new GlowLayer(`PlayerBody:glowLayer?${this.id}`, scene);
    }

    /**
     * Update player's body for the current render iteration.
     */
    doOnTick(time: number) {
        (((this.movable.movable as AnimatedMovable).movable as RelativeMovable).movable as Movable).doOnTick(time);
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

        const currentAnimation = (this.movable.movable as AnimatedMovable).currentAnimation;
        if (currentAnimation !== undefined) {
            currentAnimation.stop();
        }
        this.characterAnimations["shoot"].enableBlending = true;
        this.characterAnimations["shoot"].blendingSpeed = 0.1;
        this.characterAnimations["shoot"].start();
        this.characterAnimations["shoot"].onAnimationEndObservable.add(() => {
            this.characterAnimations["idle"].start();
            (this.movable.movable as AnimatedMovable).currentAnimation = this.characterAnimations["idle"];
        });
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
            },
            rotationAngle: this.mainMeshRotatable.angle
        };
    }

    /**
     * Sets the inner state of the PlayerBody to reflect 
     * the state represented in the given data object.
     */
    setState(state: DPlayerBody) {
        const pos = state.position;
        this.physicsAggregate.transformNode.position.set(pos.x, pos.y, pos.z);
        this.mainMeshRotatable.setAngle(state.rotationAngle);
    }

    /**
     * Enable PlayerBody to automatically keep 
     * its objects updated and to listen to 
     * relevant events (i.e. collision).
     */
    enableAutoUpdate() {
        this.arrowMeshRotatable.enableAutoUpdate();
        this.mainMeshRotatable.enableAutoUpdate();
        this.physicsAggregate.body.getCollisionObservable().add((event) => {
            const bodyId = event.collidedAgainst.transformNode.id;
            if (bodyId.includes("PlayerBody:ball") && !bodyId.includes(this.id)) {
                this.emitter.trigger("projectileHit", []);
            }
        });
    }

    /**
     * Move in given compass point direction.
     */
    move(direction: TCompassPoint) {
        this.movable.move(direction);
    }

    /**
     * Disable any objects related to UI, such as the aiming arrow.
     */
    disableUI() {
        this.arrowMesh.setEnabled(false);
    }
}