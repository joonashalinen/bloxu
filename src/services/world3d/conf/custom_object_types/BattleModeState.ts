import { GlowLayer, Mesh, MeshBuilder, Vector2, Vector3 } from "@babylonjs/core";
import Characterized from "../../../../components/classes/pub/Characterized";
import IObject from "../../../../components/objects3d/pub/IObject";
import { AnimatedMesh } from "../meshConstructors";
import EventEmitter from "../../../../components/events/pub/EventEmitter";
import ProjectileWeapon from "../../../../components/objects3d/pub/ProjectileWeapon";
import Glow from "../../../../components/graphics3d/pub/effects/Glow";
import AnimatedMovable from "../../../../components/objects3d/pub/AnimatedMovable";
import MouseRotatable from "../../../../components/objects3d/pub/MouseRotatable";

/**
 * State where the player's body is battle-ready.
 */
export default class BattleModeState {
    gun: ProjectileWeapon;
    emitter = new EventEmitter();
    glowLayer: GlowLayer;

    constructor(
        public id: string,
        public character: AnimatedMesh,
        public body: Characterized<IObject>,
        public pistolMesh: Mesh
    ) {
        const scene = this.character.mesh.getScene();
        this.glowLayer = new GlowLayer(`BattleModeState:glowLayer?${this.id}`, scene);

        pistolMesh.attachToBone(this.character.skeleton.bones[23], this.character.mesh.getChildren()[0] as Mesh);

        this.gun = new ProjectileWeapon(
            pistolMesh,
            "plasmaPistol",
            (id: string) => {
                const ball = MeshBuilder.CreateSphere(
                    `PlayerBody:ball?${this.id}`, 
                    {diameter: 0.3}, 
                    scene
                );

                // Add glow effect to ball.
                const ballGlow = new Glow(this.glowLayer, scene);
                ballGlow.apply(ball);
                
                return ball
            }
        );
    }

    /**
     * Do the main action in this state. A main action is typically 
     * what pressing the left mouse button does. For BattleModeState 
     * the main action will shoot with the player's gun.
     */
    doMainAction() {
        const direction = (this.body.as("MouseRotatable") as MouseRotatable).direction;
        this.shoot(direction);
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
        this.gun.shoot(transformedDirection);

        const currentAnimation = (this.body.as("AnimatedMovable") as AnimatedMovable).currentAnimation;
        if (currentAnimation !== undefined) {
            currentAnimation.stop();
        }
        this.character.animations["shoot"].enableBlending = true;
        this.character.animations["shoot"].blendingSpeed = 0.2;
        this.character.animations["shoot"].start();
        this.character.animations["shoot"].onAnimationEndObservable.add(() => {
            this.character.animations["idle"].start();
            (this.body.as("AnimatedMovable") as AnimatedMovable).currentAnimation = this.character.animations["idle"];
        });
    }

}