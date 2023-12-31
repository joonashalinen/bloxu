import * as babylonjs from "@babylonjs/core";

/**
 * An object that revolves around a Mesh.
 */
export default class Pointer {
    centerOfRotation: babylonjs.TransformNode;
    axis: babylonjs.Vector3 = new babylonjs.Vector3(0, 1, 0);

    constructor(
        public pointerMesh: babylonjs.Mesh,
        public targetMesh: babylonjs.Mesh
    ) {
        this.centerOfRotation = new babylonjs.TransformNode(`Pointer:centerOfRotation:${pointerMesh.id}`);
        this.centerOfRotation.position = targetMesh.position.clone();
        this.pointerMesh.parent = this.centerOfRotation;
    }

    /**
     * Updates the position of the Pointer's mesh
     * so that it is revolving around the target Mesh.
     * Should be called when the target Mesh is known
     * to have moved or possibly moved.
     */
    update() {
        this.centerOfRotation.position = this.targetMesh.position.clone();
        return this;
    }

    /**
     * Rotates the pointer around the pointed object along 
     */
    rotate(angle: number) {
        this.centerOfRotation.rotate(this.axis, angle, babylonjs.Space.WORLD);
    }

    /**
     * Sets the rotation angles of the pointer along the given main axes.
     */
    setRotation(angles: {x: number, y: number, z: number}) {
        this.centerOfRotation.rotation.x = angles.x;
        this.centerOfRotation.rotation.y = angles.y;
        this.centerOfRotation.rotation.z = angles.z;
    }
}
