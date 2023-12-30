import { Mesh, MeshBuilder, PhysicsAggregate, PhysicsShapeType, Scene, Vector3 } from "@babylonjs/core";

/**
 * A cube with collision physics and zero mass (i.e. it floats).
 */
export default class FloatingCube {
    physicsAggregate: PhysicsAggregate;
    mesh: Mesh;
    
    constructor(
        public id: string,
        public size: number, 
        public position: Vector3, 
        public scene: Scene
    ) {
        // Create cube mesh.
        this.mesh = MeshBuilder.CreateBox(id, {size: size}, this.scene);
        // Set mesh position.
        this.mesh.position.set(position.x, position.y, position.z);
        // Enable collision physics.
        this.physicsAggregate = new PhysicsAggregate(
            this.mesh, 
            PhysicsShapeType.BOX, 
            { mass: 0 }, 
            this.scene
        );
    }
}