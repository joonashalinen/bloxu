import { GlowLayer, Mesh, MeshBuilder, Vector2, Vector3 } from "@babylonjs/core";
import { AnimatedMesh } from "../meshConstructors";
import ProjectileWeapon from "../../../../components/objects3d/pub/ProjectileWeapon";
import Glow from "../../../../components/graphics3d/pub/effects/Glow";
import IMovableState from "../../../../components/objects3d/pub/creatures/IMovableState";
import IActionableState from "../../../../components/objects3d/pub/creatures/IActionableState";
import TStateResource from "../../../../components/objects3d/pub/creatures/TStateResource";
import OwningState from "../../../../components/computation/pub/OwningState";
import IRotatable from "../../../../components/objects3d/pub/IRotatable";
import MouseRotatable from "../../../../components/objects3d/pub/MouseRotatable";
import IMovable from "../../../../components/objects3d/pub/IMovable";

/**
 * State where the player's body is battle-ready.
 */
export default class ShootState extends OwningState<TStateResource> implements IMovableState, IActionableState {
    gun: ProjectileWeapon;
    glowLayer: GlowLayer;
    wantedResources: Set<TStateResource> = new Set(["animation", "rotation", "movement", "mainAction", "secondaryAction"]);
    previousMovementDirection: Vector3;
    private _ignoreNextAnimationEnd = false;

    constructor(
        public id: string,
        public character: AnimatedMesh,
        public rotatable: MouseRotatable,
        public pistolMesh: Mesh,
        public movable: IMovable
    ) {
        super();

        const scene = this.character.mesh.getScene();
        this.glowLayer = new GlowLayer(`ShootState:glowLayer?${this.id}`, scene);
        scene.meshes.forEach((m) => {
            if (m instanceof Mesh) {
                this.glowLayer.addExcludedMesh(m)
            }
        });

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

        this.character.animations["shoot"].onAnimationGroupEndObservable.add(() => {
            if (!this._ignoreNextAnimationEnd) {
                const nextState = this.previousMovementDirection.equals(new Vector3(0, 0, 0)) ? "idle" : "run";
                this._endSelf(nextState);
            } else {
                this._ignoreNextAnimationEnd = false;
            }
        });
    }

    give(resources: Set<TStateResource>): Set<TStateResource> {
        const givenResources = super.give(resources);

        if (resources.has("animation")) {
            
        }

        if (resources.has("movement")) {
            this.previousMovementDirection = this.movable.direction;
            this.movable.move(new Vector3(0, 0, 0));
        }

        return givenResources;
    }

    take(resources: Set<TStateResource>): Set<TStateResource> {
        const takenResources = super.take(resources);

        if (resources.has("animation")) {
            this.character.animations["shoot"].stop();
        }

        return takenResources;
    }

    /**
     * Do the main action in this state. A main action is typically 
     * what pressing the left mouse button does. For ShootState 
     * the main action will shoot with the player's gun.
     */
    doMainAction() {
        if (this.ownedResources.has("animation")) {
            const direction = this.rotatable.leash.lastLeash3D;
            const gunPosition = this.gun.transformNode.absolutePosition;
            const directionFromGun = direction.subtract(gunPosition);
            const transformedDirection = new Vector3(directionFromGun.x, 0, directionFromGun.z);
            this.shoot(transformedDirection);
        }
        return this;
    }

    /**
     * Movements are disabled for ShootState.
     * We take control of movements to prevent any other 
     * state from moving.
     */
    move(direction: Vector3) {
        this.previousMovementDirection = direction;
        return this;
    }

    /**
     * Shoot in the given direction. The direction is a 2D 
     * vector where the y-component corresponds 
     * with the z-coordinate in world space. The given direction vector 
     * is assumed to not be normalized. The head of the vector 
     * is assumed to be at the point that the projectile 
     * is expected to hit.
     */
    shoot(direction: Vector3) {
        if (this.isActive) {
            if (this.ownedResources.has("mainAction")) {
                this.emitter.trigger("shoot", [direction]);
                this.gun.shoot(direction);
            }

            if (this.ownedResources.has("animation")) {
                this.character.animations["shoot"].enableBlending = true;
                this.character.animations["shoot"].blendingSpeed = 0.2;
                if (this.character.animations["shoot"].isPlaying) {
                    this._ignoreNextAnimationEnd = true;
                    this.character.animations["shoot"].stop();
                }
                this.character.animations["shoot"].play();
            }
        }
    }
}