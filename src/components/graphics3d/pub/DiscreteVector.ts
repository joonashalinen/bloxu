import { Vector2, Vector3 } from "@babylonjs/core";

/**
 * A vector that can only point in a limited set amount of 
 * directions.
 */
export default class DiscreteVector {
    constructor(public values: Array<Vector2 | Vector3>) {
        
    }

    /**
     * Round the given vector to the nearest value the DiscreteVector can have.
     */
    round(vector: Vector2 | Vector3): [Vector2 | Vector3, number] {
        const values = [...this.values];
        // Note: modifies the array 'values'.
        // Ignore TypeScript type checking here because babylonjs does not have 
        // a common interface for Vector2 and Vector3. We know that both have the subtract method 
        // the length property. Thus, the code should work properly.
        // @ts-ignore
        const distancesFromVector = values.map((v) => vector.subtract(v).length(), values) as unknown as Array<number>;
        const minDistance = Math.min(...distancesFromVector);
        const closestVectorIndex = distancesFromVector.indexOf(minDistance);
        const closestVector = this.values[closestVectorIndex];
        return [closestVector, closestVectorIndex];
    }
}