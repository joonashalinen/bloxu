import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders"

export default async function(babylonjs: typeof BABYLON, scene: BABYLON.Scene) {
    const directionArrowMesh: BABYLON.AbstractMesh = (await babylonjs.SceneLoader.ImportMeshAsync(
        null,
        "assets/models/",
        "direction_arrow.glb",
        scene
    )).meshes[0];
    directionArrowMesh.setEnabled(false);
    return {
        "DirectionArrow": (id: string) => {
            const mesh = directionArrowMesh.clone(id, null);
            mesh.setEnabled(true);
            scene.addMesh(mesh);
            return mesh;
        }
    };
}