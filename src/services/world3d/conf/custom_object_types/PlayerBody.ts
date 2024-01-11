import { Color3, GlowLayer, Mesh, MeshBuilder, Scene, StandardMaterial, Vector2, Vector3 } from "@babylonjs/core";
import Movable from "../../../../components/objects3d/pub/Movable";
import Glow from "../../../../components/graphics3d/pub/effects/Glow";
import DPlayerBody from "./DPlayerBody";
import MouseRotatable from "../../../../components/objects3d/pub/MouseRotatable";
import EventEmitter from "../../../../components/events/pub/EventEmitter";
import Characterized from "../../../../components/classes/pub/Characterized";
import IObject from "../../../../components/objects3d/pub/IObject";
import { AnimatedMesh, ICharacterAnimations } from "../meshConstructors";
import ControllableBuilder from "../../../../components/objects3d/pub/ControllableBuilder";
import Physical from "../../../../components/objects3d/pub/Physical";
import AnimatedRotatable from "../../../../components/objects3d/pub/AnimatedRotatable";
import ProjectileWeapon from "../../../../components/objects3d/pub/ProjectileWeapon";
import BattleModeState from "./BattleModeState";
import TStateResource, { tStateResources } from "../../../../components/objects3d/pub/creatures/TStateResource";
import ResourceStateMachine from "../../../../components/computation/pub/ResourceStateMachine";
import IActionModeState from "./IActionModeState";
import StateMachine from "../../../../components/computation/pub/StateMachine";
import IdleState from "../../../../components/objects3d/pub/creatures/IdleState";
import MoveState from "../../../../components/objects3d/pub/creatures/MoveState";
import RotateState from "../../../../components/objects3d/pub/creatures/RotateState";
import AnimatedMovable from "../../../../components/objects3d/pub/AnimatedMovable";
import ShootState from "./ShootState";
import ActionModeState from "./ActionModeState";
import ToggleableMovable from "../../../../components/objects3d/pub/ToggleableMovable";
import EventableMovable from "../../../../components/objects3d/pub/EventableMovable";
import EventableRotatable from "../../../../components/objects3d/pub/EventableRotatable";
import PermissionResourceStateMachine from "../../../../components/computation/pub/PermissionResourceStateMachine";
import BuildModeState from "./BuildModeState";
import PlaceMeshInGridState from "./PlaceMeshInGridState";
import MeshGrid from "../../../../components/objects3d/pub/MeshGrid";
import FloatingCube from "./FloatingCube";

/**
 * The body that the Player service owns and controls.
 */
export default class PlayerBody {
    body: Characterized<IObject> = new Characterized();
    ui: Characterized<IObject> = new Characterized();
    bodyBuilder: ControllableBuilder;

    actionStateMachine: PermissionResourceStateMachine<TStateResource>;
    actionModeStateMachine: StateMachine<IActionModeState>;

    mainMesh: Mesh;
    characterAnimations: ICharacterAnimations;

    emitter = new EventEmitter();

    constructor(
        public id: string, 
        public startingPosition: Vector3, 
        public scene: Scene,
        public meshConstructors: {
            "Player": (id: string) => AnimatedMesh,
            "PlasmaPistol": (id: string) => Mesh,
            "Cube": (id: string, size: number) => Mesh
        }
    ) {
        this.startingPosition = startingPosition;

        const characterHeight = 1.8;
        const characterWidth = 0.8;

        // Load character mesh and animations.
        const character = meshConstructors["Player"](`PlayerBody:characterMesh?${this.id}`);
        this.characterAnimations = character.animations;

        // Set character mesh color.
        const characterMaterial = new StandardMaterial("PlayerBody:mesh:material?" + this.id, scene);
        
        if (this.id.includes("player-1")) {
            const color = new Color3(0.8, 0.54, 0.54);
            characterMaterial.diffuseColor = color;
            characterMaterial.ambientColor = color;
            characterMaterial.specularColor = color;
            characterMaterial.emissiveColor = new Color3(0.32, 0.11, 0.11);
        } else {
            const color = new Color3(0.49, 0.59, 0.75);
            characterMaterial.diffuseColor = color;
            characterMaterial.ambientColor = color;
            characterMaterial.specularColor = color;
            characterMaterial.emissiveColor = new Color3(0.04, 0.09, 0.16);
        }
        character.mesh.getChildMeshes().forEach((m) => m.material = characterMaterial);

        // Configure character controls.
        const controllableBuilder = new ControllableBuilder(character.mesh);
        controllableBuilder.makeMovable(
            0.0021, 
            {
                width: characterWidth, 
                height: characterHeight, 
                depth: characterWidth
            }
        );
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
        controllableBuilder.makeEventableMovable();
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
        this.bodyBuilder = controllableBuilder;
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
        
        // vvv Create state machine for the character's action states. vvv

        // Pistol mesh for the shooting state.
        const pistolMesh = meshConstructors["PlasmaPistol"]("test");

        // State machine that handles ownership of resources 
        // between the character action states.
        const resourceStateMachine = new ResourceStateMachine(
            {
                idle: new IdleState(character.animations.idle),
                run: new MoveState(
                    new ToggleableMovable(this.bodyBuilder.topMovable),
                    (this.body.as("Movable") as Movable),
                    this.body.as("AnimatedMovable") as AnimatedMovable,
                    this.body.as("EventableMovable") as EventableMovable
                ),
                rotate: new RotateState(new EventableRotatable(this.body.as("AnimatedRotatable") as AnimatedRotatable)),
                shoot: new ShootState(this.id, character, this.body.as("MouseRotatable") as MouseRotatable, pistolMesh)
            },
            new Set<TStateResource>(tStateResources)
        );

        // Add override permission checks to the state machine. 
        // Now forcing a state to change from one to another 
        // will succeed only if it is in the set table of allowed overrides.
        this.actionStateMachine = new PermissionResourceStateMachine(resourceStateMachine)
        this.actionStateMachine.overridePermissions = {
            "shoot": {
                "idle": new Set(["animation"]), 
                "rotate": new Set(tStateResources),
                "run": new Set(tStateResources)
            },
            "run": {
                "idle": new Set(["animation"]),
                "rotate": new Set(["animation"])
            },
            "rotate": {
                "idle": new Set(["animation"])
            }
        };

        // vvv Create state machine for the character's action mode states (such as build vs. battle mode) vvv

        // The ratio of the block's size to the player character's width.
        const blockSizeFactor = 0.8;
        const blockSize = characterHeight * blockSizeFactor - 0.1;

        const makeCube = (id: string) => new FloatingCube(
            id,
            blockSize,
            new Vector3(0, 0, 0),
            this.scene
        );

        const cubePrototype = this.meshConstructors.Cube(
            `PlayerBody:cubePrototype?${this.id}`, 
            blockSize
        );
        cubePrototype.setEnabled(false);

        this.actionModeStateMachine = new StateMachine({
            "battle": new BattleModeState(new ActionModeState(this.actionStateMachine, this.body)),
            "build": new BuildModeState(
                this.id, 
                new ActionModeState(this.actionStateMachine, this.body), 
                new PlaceMeshInGridState(
                    this.id,
                    (this.body.as("Physical") as Physical).physicsAggregate.transformNode,
                    new MeshGrid(
                        cubePrototype,
                        characterHeight * blockSizeFactor,
                        {x: 3, y: 1, z: 3}
                    ),
                    makeCube
                ),
                this.scene
            )
        });

        // Activate battle mode by default.
        this.actionModeStateMachine.activateState("battle");
    }

    /**
     * Update player's body for the current render iteration.
     */
    doOnTick(time: number) {
        const activeState = this.actionModeStateMachine.firstActiveState();
        activeState!.doOnTick(time);
    }

    /**
     * Do the main action of the body in its current state. 
     * Redirects the command to the current state.
     */
    doMainAction() {
        const activeState = Object.values(this.actionModeStateMachine.activeStates)[0];
        activeState.doMainAction();
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
        (this.body.as("Physical") as Physical).physicsAggregate.body.getCollisionObservable().add((event) => {
            const bodyId = event.collidedAgainst.transformNode.id;
            if (bodyId.includes("PlayerBody:ball") && !bodyId.includes(this.id)) {
                this.emitter.trigger("projectileHit", []);
            }
        });
        return this;
    }

    /**
     * Move in given direction.
     */
    move(direction: Vector2) {
        // Transform to 3D vector.
        const direction3D = new Vector3(direction.x, 0, direction.y);
        // Redirect action to the currently active state.
        const activeState = Object.values(this.actionModeStateMachine.activeStates)[0];
        activeState.move(direction3D);
    }

    /**
     * Shoot in the given direction.
     */
    shoot(direction: Vector2) {
        
    }

    /**
     * Disable any objects related to UI, such as the aiming arrow.
     */
    disableUI() {
        
    }

    /**
     * Tell the body that the pointer controller 
     * is pointing at a new position.
     */
    point(position: Vector2) {
        this.actionModeStateMachine.firstActiveState()!.point(position);
    }

    /**
     * Press a key that may result in special actions 
     * for the body.
     */
    pressFeatureKey(key: string) {
        this.actionModeStateMachine.firstActiveState()!.pressFeatureKey(key);
    }

    /**
     * Release a previously pressed down feature key.
     */
    releaseFeatureKey(key: string) {
        this.actionModeStateMachine.firstActiveState()!.releaseFeatureKey(key);
    }

    /**
     * Attempt to set the orientation angle of the body.
     * Whether the angle gets set is up to the current action state 
     * of the body.
     */
    setAngle(angle: number) {
        // Redirect action to the currently active state.
        const activeState = Object.values(this.actionModeStateMachine.activeStates)[0];
        activeState.setAngle(angle);
    }
}