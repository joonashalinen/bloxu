/**
 * Provides utilities for testing the type of a variable.
 */
export default class VariableType {
    constructor(variable) {
        this.variable = variable;
    }
    isNothing() {
        return (this.variable === null || this.variable === undefined);
    }
    isRealPrimitive() {
        return !this.isNothing() && !this.isObject() && !this.isFunction();
    }
    isPrimitive() {
        return !this.isObject() && !this.isFunction();
    }
    isFunction() {
        return typeof this.variable === "function";
    }
    isObject() {
        return typeof this.variable === "object";
    }
    isDataStructure() {
        return this.isRealObject() || this.isArray();
    }
    isRealObject() {
        return this.isObject() && !this.isNothing() && !this.isFunction() && !this.isArray();
    }
    isArray() {
        return Array.isArray(this.variable);
    }
    isInstanceOf(classType) {
        return (this.variable instanceof classType);
    }
}
//# sourceMappingURL=VariableType.js.map