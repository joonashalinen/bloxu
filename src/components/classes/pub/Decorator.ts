
/**
 * Can be used to automatically produce 
 * decorators ('decorator' as in the OOP design pattern) for classes.
 */
export default class Decorator<TWrapper extends Object, TWrappee extends Object> {
    constructor(public wrapper: TWrapper) {
        
    }

    /**
     * Make default implementations of all of wrappee's methods that 
     * are not present in wrapper. The default implementations simply 
     * redirect to the underlying wrapped object and return their return value.
     */
    decorate(wrappee: TWrappee, asProp: string) {
        // Make the wrapper wrap wrappee.
        this.wrapper[asProp] = wrappee;

        // Next we create the method implementations.

        const methodNames = Object.getOwnPropertyNames(wrappee.constructor.prototype);
        methodNames.forEach((name) => {
            if (name !== "constructor") {
                // If a method with the same name does not already exist.
                if (this.wrapper[name] === undefined) {
                    // Create method implementation.
                    this.wrapper[name] = (function(this: {wrappee: TWrappee}, ...args: unknown[]) {
                        return this.wrappee[name](...args);
                    }).bind(this.wrapper);
                }
            }
        });

        return this.wrapper;
    }
}