import { Mesh, PhysicsAggregate, PhysicsShapeType, Quaternion, Scene, SceneLoader, Vector3 } from "@babylonjs/core";
import MeshSize from "../../../../../components/graphics3d/pub/MeshSize";
import Physical from "../../../../../components/objects3d/pub/Physical";
import ObjectRegistry from "../../../../../components/objects3d/pub/ObjectRegistry";
import GridVector from "../../../../../components/graphics3d/pub/GridVector";

type MeshConstructors = {[name: string]: Function};

export default async function level(
    levelName: string, 
    scene: Scene, 
    meshConstructors: MeshConstructors,
    objects: ObjectRegistry) {
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
            mesh.setParent(null);
            objects.createObject(mesh.id, "Object", [blockSize, mesh, 0]);

            //const rotations = parseFloat((Math.random() * 4).toFixed(0));
            //physicalMesh.physicsAggregate.body.transformNode.rotation = new Vector3(0, (Math.PI / 2) * rotations, 0);
            //physicalMesh.transformNode.rotationQuaternion = Quaternion.FromEulerAngles(0, (Math.PI / 2) * rotations, 0);
        }
    });
    return rootMesh;
}