import IItem from "./IItem";
import ICollidable from "./ICollidable";

/**
 * A weapon is an item that is collidable and has a 
 * damage associated with it.
 */
export default interface IWeapon<T> extends IItem<T>, ICollidable {
    /**
     * The amount of damage the weapon does.
     */
    damage: number;
}