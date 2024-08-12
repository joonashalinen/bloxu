import { Color3, Scene, StandardMaterial, Vector2, Vector3 } from "@babylonjs/core";
import Object from "../../../components/objects3d/pub/Object";
import { AnimatedMesh } from "./meshConstructors";
import PlayerBody from "./custom_object_types/PlayerBody";
import RotationAnimation from "../../../components/graphics3d/pub/RotationAnimation";
import DirectionalAnimation from "../../../components/graphics3d/pub/DirectionalAnimation";
import DVector3 from "../../../components/graphics3d/pub/DVector3";
import Physical from "../../../components/objects3d/pub/Physical";

export type TObjectConstructor = (id: string, scene: Scene, ...args: unknown[]) => Object;

export default function (meshConstructors: {[name: string]: Function}) {
    return {
        "PlayerBody": (id: string, scene: Scene, 
            startPosition: DVector3 = {x: 0, y: 0, z: 0}) => {
            const characterHeight = 1.6;
            const characterWidth = 0.8;

            // Create character mesh with animations.
            const character = meshConstructors["Player"](`PlayerBody:characterMesh?${id}`) as AnimatedMesh;

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

            body.horizontalRotationAnimation = new RotationAnimation({
                left: character.animations["turnLeft"],
                right: character.animations["turnRight"]
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
                character.animations["idle"],
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
        }
    }; 
}