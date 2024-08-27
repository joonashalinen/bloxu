import { Vector3 } from "@babylonjs/core";
import DVector3 from "./DVector3";

/**
 * A class that stores useful utility methods that could go 
 * in babylonjs.Vector3 but aren't there.
 */
export default class Vector3Utils {
    constructor() {
        
    }

    /**
     * Transforms the given Vector3 to a DVector3.
     */
    static toObject(v: Vector3): DVector3 {
        return {x: v.x, y: v.y, z: v.z};
    }
}