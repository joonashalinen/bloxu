
/**
 * Provides utilities for testing the type of a variable.
 */
export default class VariableType {
    variable: unknown;
    
    constructor(variable: unknown) {
        this.variable = variable;
    }

    isNothing(): boolean {
        return (this.variable === null || this.variable === undefined);
    }
    
    isRealPrimitive(): boolean {   
        return !this.isNothing() && !this.isObject() && !this.isFunction();
    }
    
    isPrimitive(): boolean {    
        return !this.isObject() && !this.isFunction();
    }
    
    isFunction(): boolean {    
        return typeof this.variable === "function";
    }
    
    isObject(): boolean {    
        return typeof this.variable === "object";
    }

    isDataStructure(): boolean {
        return this.isRealObject() || this.isArray();
    }

    isRealObject(): boolean {
        return this.isObject() && !this.isNothing() && !this.isFunction() && !this.isArray();
    }
    
    isArray(): boolean {
        return Array.isArray(this.variable);
    }
    
    isInstanceOf(classType: any): boolean {
        return (this.variable instanceof classType);
    }
}