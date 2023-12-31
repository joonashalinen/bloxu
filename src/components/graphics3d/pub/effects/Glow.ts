import { Color3, GlowLayer, Mesh, MeshBuilder, Scene, StandardMaterial } from "@babylonjs/core";

/**
 * A glowing effect for a mesh.
 */
export default class Glow {
    material: StandardMaterial;
    color: Color3 = new Color3(0.43, 1, 0.89); // A greenish blue color.

    constructor( 
        public glowLayer: GlowLayer, 
        public scene: Scene
    ) {
    }

    /**
     * Applies the effect to the given mesh.
     */
    apply(mesh: Mesh) {
        this.material = new StandardMaterial(`Glow:material?${mesh.id}`, this.scene);
    
        this.material.diffuseColor = new Color3(1, 0, 1);
        this.material.specularColor = new Color3(0.5, 0.6, 0.87);
        this.material.emissiveColor = this.color;
        this.material.ambientColor = new Color3(0.23, 0.98, 0.53);
    
        mesh.material = this.material;
    
        this.glowLayer.addIncludedOnlyMesh(mesh);
    }
}