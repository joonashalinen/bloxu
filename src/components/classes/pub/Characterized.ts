
/**
 * A class that is meant to join together 
 * multiple instances of implementations of the same interface. 
 * These instances are assumed to somehow together form a single object. 
 * For example, if multiple instances wrap the same object instance, 
 * then they can be together thought of as a single, larger wrapper 
 * of the same object. Thus, they can be thought of as forming together a
 * single wrapper for the same object. These different implementations 
 * are assumed to be different 'characteristics' of the same object type 
 * (i.e. providing different new functionalities to the base type). 
 * Thus, an object with many characteristics is a 'Characterized' object.
*/
export default class Characterized<T extends Object> {
    constructor(public characteristics: {[type: string]: T} = {}) {
        
    }

    /**
     * Save an instance of a characteristic of the object.
     */
    is(instance: T) {
        this.characteristics[instance.constructor.name] = instance;
    }

    /**
     * Get the instance of a characteristic of the object.
     */
    as(characteristicType: string) {
        return this.characteristics[characteristicType];
    }
}