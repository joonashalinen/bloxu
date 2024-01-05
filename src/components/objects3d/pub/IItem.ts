import IObject from "./IObject";

/**
 * An item is an object that can be used 
 * on an object and has a type.
 */
export default interface IItem<T> extends IObject {
    /**
     * Type identifier of  the item that it 
     * shares with all other items 
     * of the same type.
     */
    type: string;

    /**
     * Use the item on the given 
     * target item.
     */
    use(target: T): void;
}