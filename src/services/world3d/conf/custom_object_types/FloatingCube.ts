import { Mesh, MeshBuilder, PhysicsAggregate, PhysicsShapeType, Scene, Vector3, StandardMaterial, Color3 } from "@babylonjs/core";

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
        // Set mesh color.
        const material = new StandardMaterial("FloatingCube:mesh:material?" + this.id, scene);
        const color = new Color3(1, 1, 1);
        material.diffuseColor = color;
        material.ambientColor = color;
        material.specularColor = color;
        // material.emissiveColor = new Color3(0.04, 0.09, 0.16);
        this.mesh.material = material;
        // Enable collision physics.
        this.physicsAggregate = new PhysicsAggregate(
            this.mesh, 
            PhysicsShapeType.BOX, 
            { mass: 0 }, 
            this.scene
        );
    }
}