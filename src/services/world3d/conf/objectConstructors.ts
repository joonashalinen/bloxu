import { AbstractMesh, Color3, GlowLayer, Mesh, MeshBuilder, Scene, StandardMaterial, Vector2, Vector3 } from "@babylonjs/core";
import Object from "../../../components/objects3d/pub/Object";
import { AnimatedMesh } from "./meshConstructors";
import PlayerBody from "./custom_object_types/PlayerBody";
import RotationAnimation from "../../../components/graphics3d/pub/RotationAnimation";
import DirectionalAnimation from "../../../components/graphics3d/pub/DirectionalAnimation";
import DVector3 from "../../../components/graphics3d/pub/DVector3";
import Physical from "../../../components/objects3d/pub/Physical";
import ProjectileWeapon from "../../../components/objects3d/pub/ProjectileWeapon";
import Glow from "../../../components/graphics3d/pub/effects/Glow";
import ObjectRegistry from "../../../components/objects3d/pub/ObjectRegistry";
import PickerPlacer from "../../../components/objects3d/pub/items/PickerPlacer";
import GridMenu from "../../../components/objects3d/pub/menus/GridMenu";
import ObjectGrid from "../../../components/objects3d/pub/ObjectGrid";
import MeshGrid from "../../../components/graphics3d/pub/MeshGrid";

export type TObjectConstructor = (id: string,  ...args: unknown[]) => Object;

export default function (
    scene: Scene,
    meshConstructors: {[name: string]: Function},
    objectRegistry: ObjectRegistry,
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

            // Set character mesh color.
            const characterMaterial = new StandardMaterial("PlayerBody:mesh:material?" + id, scene);
            const color = id.includes("player-1") ? 
                new Color3(0.94, 0.52, 0.34) : 
                new Color3(0.49, 0.59, 0.75)
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
            body.runSpeed = 2.5;

            const createProjectile = (id: string = "") => {
                const ball = MeshBuilder.CreateSphere(
                    `PlayerBody:ball?${id}`, 
                    {diameter: 0.3}, 
                    scene
                );

                // Add glow effect to ball.
                const ballGlow = new Glow(glowLayer, scene);
                ballGlow.apply(ball);
                
                return ball
            };

            const picker = new ProjectileWeapon(pistolMesh,
                createProjectile, character.animations.shoot);
            picker.projectileSpeed = 5;
            picker.useDelay = 150;
            picker.objectRegistry = objectRegistry;

            const placer = new GridMenu(
                new MeshGrid(
                    MeshGrid.createSpherePrototype(blockSize, 0.2),
                    blockSize, {x: 3, y: 1, z: 3}
                ),
                globals.objectGrid as ObjectGrid
            );
            placer.followedNode = body.transformNode;

            const pickerPlacer = new PickerPlacer(picker, placer);
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
            const physical = new Physical(mesh, mass, {
                width: size, height: size, depth: size});
            return new Object(physical);
        }
    }; 
}