import { Vector3 } from "@babylonjs/core";
import Device from "../Device";
import IItem from "./IItem";

export default interface IProjectileWeapon {
    projectiles: Device[];
    projectileSpeed: number;
    aimedDirection: Vector3;

    /**
     * Shoot the projectile weapon in the direction of 
     * the given vector.
     */
    shoot(direction: Vector3): void;
}