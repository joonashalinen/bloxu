import { PhysicsAggregate, PhysicsShapeType, TransformNode, Vector3 } from "@babylonjs/core";
import IOriented from "./IOriented";
import IWeapon from "./IWeapon";
import IProjectileWeapon from "./IProjectileWeapon";
import Movable from "./Movable";

/**
 * An IWeapon implementation that shoots projectiles. The holder of the weapon 
 * should be an IOriented so that it has an orientation direction.
 */
export default class ProjectileWeapon implements IProjectileWeapon {
    damage: number = 1;
    projectiles: Movable[] = [];

    constructor(
        public transformNode: TransformNode,
        public type: string,
        public makeProjectileMesh: (id: string) => TransformNode
    ) {
        
    }

    /**
     * Shoot in the direction the holder is facing.
     */
    use(holder: IOriented): void {
        this.shoot(holder.direction);
    }

    /**
     * When a projectile shot from the weapon collides with a mesh.
     */
    onCollide(callback: (mesh: TransformNode) => void): void {
        throw new Error("Method not implemented.");
    }

    shoot(direction: Vector3) {
        // Normalize the direction vector in case 
        // it was not already.
        const normalizedDirection = direction.normalize();

        // Create projectile.
        const projectile = this.makeProjectileMesh(`ProjectileWeapon:projectile?${this.transformNode.id}`);

        // Position the projectile in front of the weapon.
        projectile.setAbsolutePosition(
            this.transformNode.absolutePosition.add(
                new Vector3(normalizedDirection.x, 0, normalizedDirection.z)
            )
        );

        // Enable physics for the projectile.
        const physicsAggregate = new PhysicsAggregate(
            projectile, 
            PhysicsShapeType.SPHERE, 
            { mass: 0.1 }, 
            this.transformNode.getScene()
        );
        physicsAggregate.body.setLinearDamping(0);

        // Make the projectile movable.
        const movableProjectile = new Movable(physicsAggregate);
        movableProjectile.speed = 80;
        movableProjectile.gravityEnabled = false;
        
        // Make the projetile destroy blocks.
        // This should not really be here
        // and should be refactored to be elsewhere.
        physicsAggregate.body.setCollisionCallbackEnabled(true);
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
        });

        // Make the projectile keep itself in motion.
        movableProjectile.enableAutoUpdate();

        // Set its course of motion.
        movableProjectile.move(normalizedDirection);

        // Save the projectile.
        this.projectiles.push(movableProjectile);

        return this;
    }
}