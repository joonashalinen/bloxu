import { GlowLayer, Mesh, MeshBuilder, PhysicsAggregate, PhysicsShapeType, Scene, Skeleton, Vector2, Vector3 } from "@babylonjs/core";
import Movable from "../../../../components/objects3d/pub/Movable";
import Pointer from "../../../../components/objects3d/pub/Pointer";
import Follower from "../../../../components/objects3d/pub/Follower";
import Glow from "../../../../components/graphics3d/pub/effects/Glow";
import DPlayerBody from "./DPlayerBody";
import MouseRotatable from "../../../../components/objects3d/pub/MouseRotatable";
import TCompassPoint from "../../../../components/geometry/pub/TCompassPoint";
import EventEmitter from "../../../../components/events/pub/EventEmitter";
import Characterized from "../../../../components/classes/pub/Characterized";
import IObject from "../../../../components/objects3d/pub/IObject";
import CompassPointMovable from "../../../../components/objects3d/pub/CompassPointMovable";
import RelativeMovable from "../../../../components/objects3d/pub/RelativeMovable";
import AnimatedMovable from "../../../../components/objects3d/pub/AnimatedMovable";
import { AnimatedMesh, ICharacterAnimations } from "../meshConstructors";
import ControllableBuilder from "../../../../components/objects3d/pub/ControllableBuilder";
import Physical from "../../../../components/objects3d/pub/Physical";
import AnimatedRotatable from "../../../../components/objects3d/pub/AnimatedRotatable";
import AnimatedMovableRotatable from "../../../../components/objects3d/pub/AnimatedMovableRotatable";
import ProjectileWeapon from "../../../../components/objects3d/pub/ProjectileWeapon";
import BattleModeState from "./BattleModeState";

/**
 * The body that the Player service owns and controls.
 */
export default class PlayerBody {
    body: Characterized<IObject> = new Characterized();
    ui: Characterized<IObject> = new Characterized();
    currentState: BattleModeState;

    mainMesh: Mesh;
    characterAnimations: ICharacterAnimations;

    arrowMesh: Mesh;
    arrowPointer: Pointer;
    arrowFollower: Follower;
    arrowMeshRotatable: MouseRotatable;
    
    ballMovable: Movable;
    ballGlow: Glow;
    glowLayer: GlowLayer;

    gun: ProjectileWeapon;

    emitter = new EventEmitter();

    constructor(
        public id: string, 
        public startingPosition: Vector3, 
        public scene: Scene,
        public meshConstructors: {
            "DirectionArrow": (id: string) => Mesh,
            "Player": (id: string) => AnimatedMesh,
            "PlasmaPistol": (id: string) => Mesh
        }
    ) {
        this.startingPosition = startingPosition;

        // Load character mesh and animations.
        const character = meshConstructors["Player"](`PlayerBody:characterMesh?${this.id}`);
        this.characterAnimations = character.animations;

        // Configure character controls.
        const controllableBuilder = new ControllableBuilder(character.mesh);
        controllableBuilder.makeMovable(0.01);
        controllableBuilder.makeMouseRotatable();
        controllableBuilder.makeAnimatedRotatable(
            {
                left: this.characterAnimations["turnLeft"],
                right: this.characterAnimations["turnRight"]
            },
            this.characterAnimations["idle"]
        )
        // Undoes the AntiRelativeMovable (applied below), resulting in 
        // moving in the original movement direction.
        controllableBuilder.makeRelativeMovable();
        controllableBuilder.makeAnimatedMovable(
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
                character.animations["idle"],
                character.animations["moveForward"],
                character.animations["moveForwardRight"],
                character.animations["moveRight"],
                character.animations["moveBackwardRight"],
                character.animations["moveBackward"],
                character.animations["moveBackwardLeft"],
                character.animations["moveLeft"],
                character.animations["moveForwardLeft"]
            ],
            character.animations["idle"]
        );
        // Make AntiRelativeMovable to make character animations relative to the orientation.
        controllableBuilder.makeAntiRelativeMovable();
        controllableBuilder.makeCameraRelativeMovable();
        controllableBuilder.makeCompassPointMovable();
        controllableBuilder.makeAnimatedMovableRotatable();
        this.body = controllableBuilder.result;
        this.mainMesh = this.body.as("Physical").transformNode as Mesh;

        // Position the character at the given starting position.
        controllableBuilder.topNode.position.set(startingPosition.x, startingPosition.y + 4, startingPosition.z);
        
        // Configure physics settings.
        const physicsAggregate = (this.body.as("Physical") as Physical).physicsAggregate;
        // Enable collision callbacks so we can detect when the player gets hit 
        // by a projectile.
        physicsAggregate.body.setCollisionCallbackEnabled(true);
        physicsAggregate.body.setMassProperties({
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

        // Make a MouseRotatable from the arrow pointer mesh 
        // so that it follows the mouse pointer.
        this.arrowMeshRotatable = new MouseRotatable(this.arrowPointer.centerOfRotation);

        // Make the arrow follow the position of the player character.
        this.arrowFollower = new Follower(
            this.arrowPointer.centerOfRotation, 
            ((this.body.as("RelativeMovable") as RelativeMovable).movable as Movable)
        );

        // Hide the aim arrow for now. We may want to remove the aim arrow completely.
        this.disableUI();

        const pistolMesh = meshConstructors["PlasmaPistol"]("test");
        this.currentState = new BattleModeState(
            this.id,
            character,
            this.body,
            pistolMesh
        );
    }

    /**
     * Update player's body for the current render iteration.
     */
    doOnTick(time: number) {
        ((this.body.as("RelativeMovable") as RelativeMovable).movable as Movable).doOnTick(time);
        this.arrowFollower.doOnTick(time);
    }

    /**
     * Do the main action of the body in its current state. 
     * Redirects the command to the current state.
     */
    doMainAction() {
        this.currentState.doMainAction();
    }

    /**
     * Returns the state of the PlayerBody as 
     * a data object.
     */
    state(): DPlayerBody {
        const position = (this.body.as("Physical") as Physical).physicsAggregate.transformNode.position;
        return {
            position: {
                x: position.x,
                y: position.y,
                z: position.z
            },
            rotationAngle: (this.body.as("MouseRotatable") as MouseRotatable).angle
        };
    }

    /**
     * Sets the inner state of the PlayerBody to reflect 
     * the state represented in the given data object.
     */
    setState(state: DPlayerBody) {
        const pos = state.position;
        (this.body.as("Physical") as Physical).physicsAggregate.transformNode.position.set(pos.x, pos.y, pos.z);
        (this.body.as("MouseRotatable") as MouseRotatable).setAngle(state.rotationAngle);
    }

    /**
     * Enable PlayerBody to automatically keep 
     * its objects updated and to listen to 
     * relevant events (i.e. collision).
     */
    enableAutoUpdate() {
        this.arrowMeshRotatable.enableAutoUpdate();
        (this.body.as("MouseRotatable") as MouseRotatable).enableAutoUpdate();
        (this.body.as("AnimatedRotatable") as AnimatedRotatable).enableAutoUpdate();
        (this.body.as("AnimatedMovableRotatable") as AnimatedMovableRotatable).enableAutoUpdate();
        (this.body.as("Physical") as Physical).physicsAggregate.body.getCollisionObservable().add((event) => {
            const bodyId = event.collidedAgainst.transformNode.id;
            if (bodyId.includes("PlayerBody:ball") && !bodyId.includes(this.id)) {
                this.emitter.trigger("projectileHit", []);
            }
        });
        return this;
    }

    /**
     * Move in given compass point direction.
     */
    move(direction: TCompassPoint) {
        (this.body.as("CompassPointMovable") as CompassPointMovable).move(direction);
    }

    /**
     * Disable any objects related to UI, such as the aiming arrow.
     */
    disableUI() {
        this.arrowMesh.setEnabled(false);
    }
}