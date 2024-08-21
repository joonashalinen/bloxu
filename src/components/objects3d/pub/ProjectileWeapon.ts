import { AbstractMesh, AnimationGroup, TransformNode, Vector3 } from "@babylonjs/core";
import IProjectileWeapon from "./IProjectileWeapon";
import Device from "./Device";
import Physical from "./Physical";
import ISelector from "./items/ISelector";
import ObjectManager from "./ObjectManager";
import Selector from "./items/Selector";

/**
 * An IWeapon implementation that shoots projectiles. The holder of the weapon 
 * should be an IOriented so that it has an orientation direction.
 */
export default class ProjectileWeapon extends Selector implements IProjectileWeapon, ISelector {
    projectiles: Device[] = [];
    projectileSpeed: number = 1;
    projectileTimeout: number = 60000;
    objectRegistry: ObjectManager;
    destroyProjectileOnObjectHit: boolean = true;
    isActive: boolean = true;

    constructor(
        public transformNode: TransformNode,
        public makeProjectileMesh: (id: string) => AbstractMesh,
        public shootAnimation?: AnimationGroup
    ) {
        super(shootAnimation);
    }

    activate(): void {
        if (this.isActive) return;
        this.isActive = true;
    }

    deactivate(): void {
        if (!this.isActive) return;
        this.isActive = false;
    }

    doMainAction(): void {
        super.doMainAction();
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

        // Set the physics properties of the projectile.
        projectile.asPhysical.physicsAggregate.body.disablePreStep = false;
        projectile.transformNode.setAbsolutePosition(
            this.transformNode.absolutePosition
            .add(normalizedDirection.scale(0.1)));
        projectile.asPhysical.physicsAggregate.body.setLinearDamping(0);
        projectile.respectVerticalVelocity = false;
        projectile.perpetualMotionSpeed = this.projectileSpeed;
        projectile.setPerpetualMotionDirection(normalizedDirection);

        // Make the projectile trigger a 'selectObject' event when 
        // it hits an object.
        projectile.physicsBody().setCollisionCallbackEnabled(true);
        projectile.physicsBody().getCollisionObservable().add((event) => {
            const otherMesh = event.collidedAgainst.transformNode;
            if (this.objectRegistry &&
                this.objectRegistry.hasObjectWithMeshId(otherMesh.id)) {
                const object = this.objectRegistry.getObjectWithMeshId(otherMesh.id);
                if (this.destroyProjectileOnObjectHit) 
                    this.destroyProjectile(projectile);
                this.emitter.trigger("select", [{
                    object: object, 
                    absolutePosition: object.transformNode.absolutePosition.clone()
                }]);
            }
        });

        this.projectiles.push(projectile);

        // Set timeout for removing the projectile 
        // after it has existed for too long.
        setTimeout(() => {
            
        }, this.projectileTimeout);
    }

    destroyProjectile(projectile: Device) {
        this.projectiles.splice(
            this.projectiles.indexOf(projectile), 1);
        projectile.transformNode.getScene().removeMesh(
            projectile.transformNode as AbstractMesh, true);
        projectile.physicsBody().dispose();
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