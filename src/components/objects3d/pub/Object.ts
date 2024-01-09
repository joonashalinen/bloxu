import { TransformNode } from "@babylonjs/core";
import IObject from "./IObject";

/**
 * Default implementation of an IObject.
 * Does nothing except wraps the given TransformNode.
 */
export default class Object implements IObject {
    constructor(public transformNode: TransformNode) {
        
    }
}