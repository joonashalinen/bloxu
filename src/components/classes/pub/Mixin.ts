
/**
 * Provides the ability to add 
 * the methods and properties of a class instance 
 * to another.
 */
export default class Mixin<T extends Object> {
    constructor(public target: T) {
    }

    /**
     * Add the methods and properties of the 
     * the given object to the target object.
     * 
     * @param target The object to which the methods and properties will be added.
     * @param source The object from which the methods and properties will be taken.
     */
    extend<U extends object, >(source: U): T & U {
        var methodNames = Object.getOwnPropertyNames(source.constructor.prototype);
        methodNames.forEach((name) => {
            if (name !== "constructor") {
                this.target[name] = (source[name] as Function).bind(this.target);
            }
        });
        return this.target as T & U;
    }
}