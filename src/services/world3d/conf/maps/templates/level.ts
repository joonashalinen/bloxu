import { Mesh, Scene, SceneLoader, Space, Vector3 } from "@babylonjs/core";
import MeshSize from "../../../../../components/graphics3d/pub/MeshSize";
import ObjectManager from "../../../../../components/objects3d/pub/ObjectManager";
import GridVector from "../../../../../components/graphics3d/pub/GridVector";
import ObjectGrid from "../../../../../components/objects3d/pub/ObjectGrid";

type MeshConstructors = {[name: string]: Function};

export default async function level(
    levelName: string, 
    scene: Scene, 
    meshConstructors: MeshConstructors,
    objects: ObjectManager,
    globals: {[name: string]: unknown}) {
    // Reset the object grid in case another map's objects were still
    // present there.
    (globals.objectGrid as ObjectGrid).reset();

    const levelMapImport = (await SceneLoader.LoadAssetContainerAsync(
        "assets/models/maps/",
        levelName + ".gltf",
        scene
    ));

    const entries = levelMapImport.instantiateModelsToScene();
    const rootMesh = entries.rootNodes[0] as Mesh;
    rootMesh.translate(Vector3.Forward(), -5);
    rootMesh.translate(Vector3.Right(), -2);

    // First we scale the map parent mesh so that its blocks are of 
    // the standard block size used in the game.

    const firstBlockMesh = rootMesh.getChildMeshes().find((mesh) => mesh.id.includes("Blocks::"));
    const initialMapBlockWidth = (new MeshSize(firstBlockMesh)).width();
    const mapScalingFactor = (globals.cellSize as number) / initialMapBlockWidth;
    rootMesh.scaling.scaleInPlace(mapScalingFactor);

    // Then, we transform all individual meshes from the map
    // into their corresponding game meshes and objects.

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
                globals.cellSize as number)
            ).floor())
        }

        if (meshName.includes("Blocks")) {
            // Do random rotation around the y-axis to bring some 
            // variety to the look of the blocks, since they often have different textures
            // on different sides.
            const rotations = parseFloat((Math.random() * 4).toFixed(0));
            mesh.rotate(Vector3.Up(), (Math.PI / 2) * rotations, Space.WORLD);

            mesh.setParent(null);
            const block = objects.createObject(mesh.id, "Object", [globals.cellSize as number, mesh, 0]);
            block.physicsBody().disablePreStep = false;
            block.triggerChangeStateEvents = true;
            (globals.objectGrid as ObjectGrid).placeAtPosition(
                block.transformNode.getAbsolutePosition().clone(), block);
            if (meshName.includes("Blocks::partition")) block.isLocked = true;

        } else if (meshName.includes("Interactables::portal")) {
            const portal = objects.createObject("Interactables::portal?0", "Interactables::portal", [mesh]);
            portal.isLocked = true;
        }
    });
    return rootMesh;
}