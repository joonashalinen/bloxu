import { AbstractMesh } from "@babylonjs/core";

/**
 * Implements operations on the size of a mesh.
 */
export default class MeshSize {
    constructor(public mesh: AbstractMesh) {
        
    }

    /**
     * The diameter of the bounding box of the mesh in world coordinates.
     */
    diameter() {
        const bounds = this.mesh.getHierarchyBoundingVectors();
        return bounds.max.subtract(bounds.min).length();
    }

    /**
     * Scales the mesh so that its diameter is the same 
     * as the given diameter.
     */
    scaleToDiameter(diameter: number) {
        const currentDiameter = this.diameter();
        const scalingFactor = diameter / currentDiameter;
        this.mesh.scaling.scaleInPlace(scalingFactor);
    }

    /**
     * Scales the mesh's bounding box to have the diameter of a unit cube.
     */
    scaleToUnitSize() {
        this.scaleToDiameter(Math.sqrt(3));
    }
}