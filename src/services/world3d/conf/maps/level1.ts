import { Mesh, PhysicsAggregate, PhysicsShapeType, Scene, SceneLoader, Vector3 } from "@babylonjs/core";

export default async function level1(scene: Scene) {
    const level1MapImport = (await SceneLoader.LoadAssetContainerAsync(
        "assets/models/",
        "level1-map.gltf",
        scene
    ));

    const entries = level1MapImport.instantiateModelsToScene();
    const rootMesh = entries.rootNodes[0] as Mesh;
    rootMesh.rotate(Vector3.Up(), (-1) * Math.PI/2);
    rootMesh.translate(Vector3.Forward(), 10);
    rootMesh.scaling.scaleInPlace(1.8);
    rootMesh.getChildMeshes().forEach((mesh: Mesh) => {
        new PhysicsAggregate(
            mesh, 
            PhysicsShapeType.MESH, 
            { mass: 0 }, 
            scene
        );
        if (mesh.name.includes("wall")) {
            mesh.visibility = 0.6;
        }
    });

    return rootMesh;
}