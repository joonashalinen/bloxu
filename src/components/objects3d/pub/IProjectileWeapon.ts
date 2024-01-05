import { Vector3 } from "@babylonjs/core";
import IWeapon from "./IWeapon";
import IOriented from "./IOriented";
import Movable from "./Movable";

export default interface IProjectileWeapon extends IWeapon<IOriented> {
    projectiles: Movable[];

    /**
     * Shoot the projectile weapon in the direction of 
     * the given vector.
     */
    shoot(direction: Vector3): IProjectileWeapon;
}