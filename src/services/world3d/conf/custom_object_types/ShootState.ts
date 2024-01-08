import { GlowLayer, Mesh, MeshBuilder, Skeleton, TransformNode, Vector2, Vector3 } from "@babylonjs/core";
import Characterized from "../../../../components/classes/pub/Characterized";
import IObject from "../../../../components/objects3d/pub/IObject";
import { AnimatedMesh } from "../meshConstructors";
import ProjectileWeapon from "../../../../components/objects3d/pub/ProjectileWeapon";
import Glow from "../../../../components/graphics3d/pub/effects/Glow";
import AnimatedMovable from "../../../../components/objects3d/pub/AnimatedMovable";
import MouseRotatable from "../../../../components/objects3d/pub/MouseRotatable";
import IMovableState from "../../../../components/objects3d/pub/creatures/IMovableState";
import IActionableState from "../../../../components/objects3d/pub/creatures/IActionableState";
import TStateResource from "../../../../components/objects3d/pub/creatures/TStateResource";
import OwningState from "../../../../components/computation/pub/OwningState";
import IRotatable from "../../../../components/objects3d/pub/IRotatable";

/**
 * State where the player's body is battle-ready.
 */
export default class ShootState extends OwningState<TStateResource> implements IMovableState, IActionableState {
    gun: ProjectileWeapon;
    glowLayer: GlowLayer;
    wantedResources: Set<TStateResource> = new Set(["animation", "rotation", "movement", "mainAction", "secondaryAction"]);

    constructor(
        public id: string,
        public character: AnimatedMesh,
        public rotatable: IRotatable,
        public pistolMesh: Mesh
    ) {
        super();

        const scene = this.character.mesh.getScene();
        this.glowLayer = new GlowLayer(`ShootState:glowLayer?${this.id}`, scene);

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

        this.character.animations["shoot"].onAnimationEndObservable.add(() => {
            this._endSelf("idle");
        });
    }

    give(resources: Set<TStateResource>): Set<TStateResource> {
        const givenResources = super.give(resources);

        if (resources.has("animation")) {
            this.pistolMesh.attachToBone(
                this.character.skeleton.bones[23], 
                this.character.mesh.getChildren()[0] as Mesh
            );
        }

        return givenResources;
    }

    take(resources: Set<TStateResource>): Set<TStateResource> {
        const takenResources = super.take(resources);

        if (resources.has("animation")) {
            this.pistolMesh.detachFromBone(true);
        }

        return takenResources;
    }

    /**
     * Do the main action in this state. A main action is typically 
     * what pressing the left mouse button does. For ShootState 
     * the main action will shoot with the player's gun.
     */
    doMainAction() {
        if (this.isActive) {
            const direction = this.rotatable.direction;
            this.shoot(direction);
        }
        return this;
    }

    /**
     * Movements are disabled for ShootState.
     * We take control of movements to prevent any other 
     * state from moving.
     */
    move(direction: Vector3) {
        // Do nothing.
        return this;
    }

    /**
     * Shoot in the given direction. The direction is a 2D 
     * vector where the y-component corresponds 
     * with the z-coordinate in world space.
     */
    shoot(direction: Vector2) {
        if (this.isActive) {
            if (this.ownedResources.has("mainAction")) {
                // Apply needed transformations to make the ball shoot out correctly.
                // These values were found by manual testing and a more in-depth 
                // exploration of why this is needed should be done.
                const transformedDirection = new Vector3(direction.x * (-1), 0, direction.y);
                this.gun.shoot(transformedDirection);
            }

            if (this.ownedResources.has("animation")) {
                this.character.animations["shoot"].enableBlending = true;
                this.character.animations["shoot"].blendingSpeed = 0.2;
                this.character.animations["shoot"].start();
            }
        }
    }
}