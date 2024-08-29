
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
        // Copy public properties from source to target.
        const propNames = Object.getOwnPropertyNames(source);
        propNames.forEach((name) => {
            if (this.target[name] !== undefined) {
                throw new Error(`Mixin conflict with property '${name}'`);
            } else {
                this.target[name] = source[name];
            }
        });
        // Copy public methods from source to target.
        const methodNames = Object.getOwnPropertyNames(source.constructor.prototype);
        methodNames.forEach((name) => {
            if (name !== "constructor") {
                if (this.target[name] !== undefined) {
                    throw new Error(`Mixin conflict with method '${name}'`);
                } else {
                    this.target[name] = (source[name] as Function).bind(this.target);
                }
            }
        });
        return this.target as T & U;
    }
}