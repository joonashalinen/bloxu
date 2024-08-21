import { Mesh, PhysicsAggregate, PhysicsShapeType, Quaternion, Scene, SceneLoader, Space, Vector3 } from "@babylonjs/core";
import MeshSize from "../../../../../components/graphics3d/pub/MeshSize";
import Physical from "../../../../../components/objects3d/pub/Physical";
import ObjectManager from "../../../../../components/objects3d/pub/ObjectManager";
import GridVector from "../../../../../components/graphics3d/pub/GridVector";

type MeshConstructors = {[name: string]: Function};

export default async function level(
    levelName: string, 
    scene: Scene, 
    meshConstructors: MeshConstructors,
    objects: ObjectManager) {
    const blockSize = 1.4;

    const levelMapImport = (await SceneLoader.LoadAssetContainerAsync(
        "assets/models/",
        levelName + ".gltf",
        scene
    ));

    const entries = levelMapImport.instantiateModelsToScene();
    const rootMesh = entries.rootNodes[0] as Mesh;
    rootMesh.translate(Vector3.Forward(), -5);
    rootMesh.translate(Vector3.Right(), -2);
    rootMesh.scaling.scaleInPlace(12);
    [...rootMesh.getChildMeshes()].forEach((mesh: Mesh, index: number) => {
        const meshName = mesh.name.includes("Clone of ") ? 
            mesh.name.split("Clone of ")[1] : mesh.name;
        mesh.id = mesh.name + "?" + index;

        if (meshConstructors[meshName] !== undefined) {
            const templateDiameter = (new MeshSize(mesh)).diameter();
            const replacementMesh: Mesh = meshConstructors[meshName]();

            replacementMesh.setParent(mesh.parent);
            replacementMesh.setAbsolutePosition(mesh.absolutePosition.clone());
            (new MeshSize(replacementMesh)).scaleToDiameter(templateDiameter * 0.9);

            mesh.setParent(null);
            scene.removeMesh(mesh);
            replacementMesh.name = mesh.name;
            replacementMesh.id = mesh.name + "?" + index;
            mesh = replacementMesh;
            mesh.setAbsolutePosition((new GridVector(
                mesh.absolutePosition,
                blockSize)
            ).floor())
        }

        if (meshName.includes("Blocks")) {
            // Do random rotation around the y-axis to bring some 
            // variety to the look of the blocks, since they often have different textures
            // on different sides.
            const rotations = parseFloat((Math.random() * 4).toFixed(0));
            mesh.rotate(Vector3.Up(), (Math.PI / 2) * rotations, Space.WORLD);

            mesh.setParent(null);
            objects.createObject(mesh.id, "Object", [blockSize, mesh, 0]);

        } else if (meshName.includes("Interactables::portal")) {
            objects.createObject(mesh.id, "Interactables::portal", [mesh]);
        }
    });
    return rootMesh;
}