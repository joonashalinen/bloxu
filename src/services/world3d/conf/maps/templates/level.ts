import { Mesh, PhysicsAggregate, PhysicsShapeType, Quaternion, Scene, SceneLoader, Vector3 } from "@babylonjs/core";
import MeshSize from "../../../../../components/graphics3d/pub/MeshSize";
import Physical from "../../../../../components/objects3d/pub/Physical";

type MeshConstructors = {[name: string]: Function};

export default async function level(
    levelName: string, 
    scene: Scene, 
    meshConstructors: MeshConstructors) {
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
    [...rootMesh.getChildMeshes()].forEach((mesh: Mesh) => {
        const meshName = mesh.name.includes("Clone of ") ? 
            mesh.name.split("Clone of ")[1] : mesh.name;

        if (meshConstructors[meshName] !== undefined) {
            const templateDiameter = (new MeshSize(mesh)).diameter();
            const replacementMesh: Mesh = meshConstructors[meshName]();

            replacementMesh.setParent(mesh.parent);
            replacementMesh.setAbsolutePosition(mesh.absolutePosition.clone());
            (new MeshSize(replacementMesh)).scaleToDiameter(templateDiameter * 0.9);

            mesh.setParent(null);
            scene.removeMesh(mesh);
            mesh = replacementMesh;
        }

        if (meshName.includes("Blocks")) {
            const meshParent = mesh.parent;
            mesh.setParent(null);
            const physicalMesh = new Physical(mesh, 0, {
                width: 1.4, height: 1.4, depth: 1.4});
            
            //const rotations = parseFloat((Math.random() * 4).toFixed(0));
            //physicalMesh.physicsAggregate.body.transformNode.rotation = new Vector3(0, (Math.PI / 2) * rotations, 0);
            //physicalMesh.transformNode.rotationQuaternion = Quaternion.FromEulerAngles(0, (Math.PI / 2) * rotations, 0);
        }
    });
    return rootMesh;
}