import { AbstractMesh, AnimationGroup, TransformNode, Vector3 } from "@babylonjs/core";
import IOriented from "./IOriented";
import IProjectileWeapon from "./IProjectileWeapon";
import Device from "./Device";
import Physical from "./Physical";
import EventEmitter from "../../events/pub/EventEmitter";
import Item from "./creatures/Item";

/**
 * An IWeapon implementation that shoots projectiles. The holder of the weapon 
 * should be an IOriented so that it has an orientation direction.
 */
export default class ProjectileWeapon extends Item implements IProjectileWeapon {
    projectiles: Device[] = [];
    projectileSpeed: number = 1;

    constructor(
        public transformNode: TransformNode,
        public makeProjectileMesh: (id: string) => AbstractMesh,
        public shootAnimation?: AnimationGroup
    ) {
        super(shootAnimation);
    }

    doMainAction(): void {
        super.doMainAction();
    }

    /**
     * When a projectile shot from the weapon collides with a mesh.
     */
    onCollide(callback: (mesh: TransformNode) => void): void {
        throw new Error("Method not implemented.");
    }

    shoot(direction: Vector3) {
        this.aimedDirection = direction;
        this.shootInAimedDirection();
    }

    /**
     * Shoot in the currently aimed direction.
     */
    shootInAimedDirection() {
        // Normalize the direction vector in case 
        // it was not already.
        const normalizedDirection = this.aimedDirection.normalize();

        // Create projectile.
        const projectileMesh = this.makeProjectileMesh(
            `ProjectileWeapon:projectile?${this.transformNode.id}`
            );
        const projectile = new Device(
            new Physical(projectileMesh, 0.1));

        projectile.asPhysical.physicsAggregate.body.disablePreStep = false;
        projectile.transformNode.setAbsolutePosition(
            this.transformNode.absolutePosition
            .add(normalizedDirection.scale(0.1)));
        projectile.asPhysical.physicsAggregate.body.setLinearDamping(0);
        projectile.respectVerticalVelocity = false;
        projectile.perpetualMotionSpeed = this.projectileSpeed;
        projectile.setPerpetualMotionDirection(normalizedDirection);
        
        // Make the projetile destroy blocks.
        // This should not really be here
        // and should be refactored to be elsewhere.
        /* physicsAggregate.body.setCollisionCallbackEnabled(true);
        physicsAggregate.body.getCollisionObservable().add((event) => {
            const otherMesh = event.collidedAgainst.transformNode;
            // Destroy block.
            if (
                otherMesh.id.includes("PlaceMeshInGridState:object") || 
                otherMesh.id.includes("FloatingCube")
            ) {
                event.collidedAgainst.disablePreStep = true;
                otherMesh.setEnabled(false);
                event.collidedAgainst.dispose();
            }
            // Destroy projectile.
            movableProjectile.move(new Vector3(0, 0, 0));
            physicsAggregate.body.transformNode.setEnabled(false);
            physicsAggregate.body.dispose();
        }); */

        this.projectiles.push(projectile);
    }

    doOnTick(passedTime: number, absoluteTime: number) {
        this.projectiles.forEach((projectile) => projectile
            .doOnTick(passedTime, absoluteTime));
    }

    protected _doMainActionWithoutAnimation() {
        this.shootInAimedDirection();
        this._itemUsed = true;
        if (this._animationEnded) this.emitter.trigger("useEnded");
    }
}