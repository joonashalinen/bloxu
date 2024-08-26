import { AbstractMesh, Color3, GlowLayer, IPhysicsCollisionEvent, Mesh, MeshBuilder, Scene, StandardMaterial, Vector2, Vector3 } from "@babylonjs/core";
import Object3 from "../../../components/objects3d/pub/Object";
import { AnimatedMesh } from "./meshConstructors";
import PlayerBody from "./custom_object_types/PlayerBody";
import RotationAnimation from "../../../components/graphics3d/pub/animations/RotationAnimation";
import DirectionalAnimation from "../../../components/graphics3d/pub/animations/DirectionalAnimation";
import DVector3 from "../../../components/graphics3d/pub/DVector3";
import Physical from "../../../components/objects3d/pub/Physical";
import Glow from "../../../components/graphics3d/pub/effects/Glow";
import ObjectManager from "../../../components/objects3d/pub/ObjectManager";
import PickerPlacer from "../../../components/objects3d/pub/items/PickerPlacer";
import GridMenu from "../../../components/objects3d/pub/menus/GridMenu";
import ObjectGrid from "../../../components/objects3d/pub/ObjectGrid";
import MeshGrid from "../../../components/graphics3d/pub/MeshGrid";
import Portal from "../../../components/objects3d/pub/Portal";
import ProjectileWeapon from "../../../components/objects3d/pub/items/ProjectileWeapon";
import JumpState from "../../../components/objects3d/pub/creatures/JumpState";
import Placer from "../../../components/objects3d/pub/items/Placer";
import Picker from "../../../components/objects3d/pub/items/Picker";
import AnimationFactory from "../../../components/graphics3d/pub/animations/AnimationFactory";
import Animation from "../../../components/graphics3d/pub/animations/Animation";
import AirborneState from "../../../components/objects3d/pub/creatures/AirborneState";

export type TObjectConstructor = (id: string,  ...args: unknown[]) => Object3;

export default function (
    scene: Scene,
    meshConstructors: {[name: string]: Function},
    objectManager: ObjectManager,
    glowLayer: GlowLayer,
    globals: {[name: string]: unknown}) {
    return {
        "PlayerBody": (id: string, startPosition: DVector3 = {x: 0, y: 0, z: 0}) => {
            const characterHeight = 1.55;
            const characterWidth = 0.4;
            const blockSize = 1.4;
            const characterMeshId = `PlayerBody:characterMesh?${id}`;

            const pistolMesh = meshConstructors["PlasmaPistol"](`${characterMeshId}:pistolMesh`);

            // Create character mesh with animations.
            const character = meshConstructors["Player"](characterMeshId,
                pistolMesh) as AnimatedMesh;

            character.mesh.setEnabled(true);
            character.mesh.renderOutline = true;
            character.mesh.outlineColor = new Color3(0, 0, 0);
            character.mesh.outlineWidth = 2;

            // Set character mesh color.
            const characterMaterial = new StandardMaterial("PlayerBody:mesh:material?" + id, scene);
            const color = id.includes("player-1") ? 
                new Color3(1, 0.43, 0.3) : 
                new Color3(0.43, 0.6, 0.9)
            characterMaterial.diffuseColor = color;
            characterMaterial.ambientColor = color;
            characterMaterial.specularColor = color;
            character.mesh.getChildMeshes().forEach((m) => m.material = characterMaterial);

            const physical = new Physical(character.mesh, 1, {
                height: characterHeight,
                width: characterWidth,
                depth: characterWidth
            });

            const body = new PlayerBody(physical, character.animations);
            body.ownerId = id;
            body.runSpeed = 2.5;
            body.respawnPoint = new Vector3(startPosition.x, startPosition.y, startPosition.z);
            body.respawnOnDeath = true;
            body.canLand = (event: IPhysicsCollisionEvent) => {
                const objectLandedOn = objectManager
                    .getObjectWithMeshId(event.collidedAgainst.transformNode.id);
                if (objectLandedOn !== undefined) {
                    const cell = (globals.objectGrid as ObjectGrid).objectCoordinates(objectLandedOn);
                    if (cell !== undefined) {
                        cell.y = parseInt((cell.y + 1).toFixed(0));
                        return !((globals.objectGrid as ObjectGrid).cellIsOccupied(cell));
                    } else {
                        return true;
                    }
                } else {
                    return true;
                }
            };
            body.rectifyFalseLanding = () => {
                // Push the object back from the surface it is dragging along.
                // This is to prevent the player body from getting stuck on a non-existent or 
                // very tiny ledge. For some reason Havok or babylonjs sometimes makes 
                // the object land on a ledge that is past the wall the player is bumping against.
                // This makes it possible for the player to wall jump because they can sometimes
                // land on blocks even if they are bumping against a block that is above it.
                const bodyMotion = body.perpetualMotionDirection;
                const pushBackVector = (new Vector3(bodyMotion.x, 0, bodyMotion.z))
                    .normalize().negateInPlace();
                pushBackVector.scaleInPlace(0.1);
                body.transformNode.setAbsolutePosition(
                    body.transformNode.absolutePosition.add(pushBackVector));
            };

            // Jump state and airborne state need some extra
            //  configuring to make the animations look better.

            let endCleanupTimeout: NodeJS.Timeout;
            const restoreBlendingSpeeds = () => {
                endCleanupTimeout = setTimeout(() => {
                    (Object.values(character.animations)).forEach((animation) => {
                        animation.blendingSpeed = 0.2;
                    });
                }, 500);
            };
            const slowdownBlendingSpeeds = (to: number) => {
                clearTimeout(endCleanupTimeout);
                (Object.values(character.animations)).forEach((animation) => {
                    animation.blendingSpeed = to;
                });
            };
            
            const jumpState = (body.actionStateMachine.states["jump"] as JumpState);
            jumpState.playAnimation = (animation) => {
                slowdownBlendingSpeeds(0.1);
                character.animations.jump.blendingSpeed = 0.05;
                animation.play();
                animation.goToFrame(44);
            };
            jumpState.endCleanup = restoreBlendingSpeeds;

            const airborneState = (body.actionStateMachine.states["airborne"] as AirborneState);
            airborneState.playAnimation = (animation) => {
                slowdownBlendingSpeeds(0.1);
                character.animations.hover.blendingSpeed = 0.05;
                animation.play(true);
            };
            airborneState.endCleanup = restoreBlendingSpeeds;

            const createProjectile = (id: string = "") => {
                const ball = MeshBuilder.CreateSphere(
                    `PlayerBody:ball?${id}`, 
                    {diameter: 0.3}, 
                    scene
                );

                // Add glow effect to ball.
                const ballGlow = new Glow(glowLayer, scene);
                ballGlow.color = id.includes("player-1") ? 
                    new Color3(1, 0.6, 0.5) : 
                    ballGlow.color;
                ballGlow.apply(ball);
                
                return ball
            };

            const projectileWeapon = new ProjectileWeapon(pistolMesh,
                createProjectile, character.animations.shoot);
            projectileWeapon.ownerId = id;
            projectileWeapon.projectileSpeed = 5;
            projectileWeapon.useDelay = 150;
            projectileWeapon.objectRegistry = objectManager;

            const picker = new Picker(projectileWeapon);
            picker.ownerId = id;

            const placer = new Placer(
                new GridMenu(
                    new MeshGrid(
                        MeshGrid.createSpherePrototype(blockSize, 0.2),
                        blockSize, {x: 3, y: 1, z: 3}, id
                    )
                ),
                globals.objectGrid as ObjectGrid
            );
            placer.ownerId = id;
            (placer.selector as GridMenu).followedNode = body.transformNode;

            const pickerPlacer = new PickerPlacer(picker, placer);
            pickerPlacer.ownerId = id;
            pickerPlacer.paintOwnedObject = (object) => {
                const overlayColor = id.includes("player-1") ? 
                    new Color3(1, 0.5, 0.35) : 
                    new Color3(0.3, 0.7, 1);
                // Show overlay for the picked object.
                const overlayAlpha = 0.4;
                object.rootMesh().overlayAlpha = overlayAlpha;
                object.rootMesh().overlayColor = overlayColor;
                object.rootMesh().renderOverlay = true;
            };
            pickerPlacer.unpaintOwnedObject = (object) => {
                object.rootMesh().renderOverlay = false;
            };
            pickerPlacer.linkWith(globals.pickerPlacers as Set<PickerPlacer>);
            (globals.pickerPlacers as Set<PickerPlacer>).add(pickerPlacer);

            body.items["pickerPlacer"] = pickerPlacer;
            body.selectItem("pickerPlacer");

            body.horizontalRotationAnimation = new RotationAnimation({
                left: character.animations["turnLeft"],
                right: character.animations["turnRight"],
                idle: character.animations["idle"]
            });

            const movementDirections = [
                new Vector2(0, 0),
                new Vector2(0, 1),
                (new Vector2(1, 1)).normalize(),
                new Vector2(1, 0),
                (new Vector2(1, -1)).normalize(),
                new Vector2(0, -1),
                (new Vector2(-1, -1)).normalize(),
                new Vector2(-1, 0),
                (new Vector2(-1, 1)).normalize(),
            ];

            const directionAnimations = [
                undefined,
                character.animations["moveForward"],
                character.animations["moveForwardRight"],
                character.animations["moveRight"],
                character.animations["moveBackwardRight"],
                character.animations["moveBackward"],
                character.animations["moveBackwardLeft"],
                character.animations["moveLeft"],
                character.animations["moveForwardLeft"]
            ];

            body.directionalAnimation = new DirectionalAnimation(
                movementDirections, directionAnimations);
            
            // Configure physics settings.
            const physicsAggregate = body.asPhysical.physicsAggregate;
            // Enable collision callbacks so we can detect when the player gets hit 
            // by a projectile.
            physicsAggregate.body.setCollisionCallbackEnabled(true);
            physicsAggregate.body.setMassProperties({
                inertia: new Vector3(0, 0, 0)
            });
            physicsAggregate.body.disablePreStep = false;

            // Position the character at the given starting position.
            body.transformNode.position.set(
                startPosition.x, startPosition.y, startPosition.z);

            // Fix vertical positioning of the player character mesh. Currently 
            // it for some reason is above the hitbox. TODO: Find out why this happens.
            character.mesh.position.y -= characterHeight / 2;

            return body;
        },
        "Object": (id: string, size: number, mesh: Mesh, mass: number) => {
            mesh.setEnabled(true);
            const physical = new Physical(mesh, mass, {
                width: size, height: size, depth: size});
            return new Object3(physical);
        },
        "Interactables::portal": (id: string, mesh: AbstractMesh) => {
            mesh.setEnabled(true);
            return new Portal(mesh);
        }
    }; 
}