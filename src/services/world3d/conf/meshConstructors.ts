import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders"

export interface ICharacterAnimations {
    "idle": BABYLON.AnimationGroup, 
    "moveForward": BABYLON.AnimationGroup, 
    "moveForwardRight": BABYLON.AnimationGroup, 
    "moveForwardLeft": BABYLON.AnimationGroup, 
    "moveRight": BABYLON.AnimationGroup, 
    "moveBackward": BABYLON.AnimationGroup, 
    "moveBackwardRight": BABYLON.AnimationGroup, 
    "moveBackwardLeft": BABYLON.AnimationGroup, 
    "moveLeft": BABYLON.AnimationGroup,
    "turnLeft": BABYLON.AnimationGroup,
    "turnRight": BABYLON.AnimationGroup,
    "shoot": BABYLON.AnimationGroup
}

export default async function(babylonjs: typeof BABYLON, scene: BABYLON.Scene) {
    const directionArrowMesh: BABYLON.AbstractMesh = (await babylonjs.SceneLoader.ImportMeshAsync(
        null,
        "assets/models/",
        "direction_arrow.glb",
        scene
    )).meshes[0];
    directionArrowMesh.setEnabled(false);
    
    const playerMeshImport = (await babylonjs.SceneLoader.LoadAssetContainerAsync(
        "assets/models/",
        "player.glb",
        scene
    ));
    playerMeshImport.rootNodes[0].setEnabled(false);

    const gunMeshImport = (await babylonjs.SceneLoader.LoadAssetContainerAsync(
        "assets/models/",
        "plasma_pistol.glb",
        scene
    ));
    gunMeshImport.meshes[0].setEnabled(false);

    return {
        "DirectionArrow": (id: string) => {
            const mesh = directionArrowMesh.clone(id, null);
            mesh!.setEnabled(true);
            scene.addMesh(mesh!);
            return mesh;
        },
        "Player": (id: string) => {
            const entries = playerMeshImport.instantiateModelsToScene();
            const rootMesh = entries.rootNodes[0] as BABYLON.Mesh;
            const characterMesh = rootMesh.getChildren()[0] as BABYLON.Mesh;

            console.log(characterMesh)
            rootMesh!.rotate(babylonjs.Vector3.Up(), (-1) * Math.PI / 2);
            characterMesh!.rotate(babylonjs.Vector3.Forward(), Math.PI / 2);
            rootMesh!.position = new BABYLON.Vector3(0, 0, 0);
            rootMesh!.scaling = rootMesh!.scaling.scale(0.3);
            // entries.skeletons[0].bones.map((bone) => bone.scale(0.3, 0.3, 0.3, true));
            rootMesh!.setEnabled(true);
            characterMesh.id = id;
            rootMesh.id = "Root:" + id;

            const skeleton = entries.skeletons[0];
            // @ts-ignore
            skeleton.position = new BABYLON.Vector3(0, 0, 0);
            // @ts-ignore
            skeleton.scaling = new BABYLON.Vector3(0.3, 0.3, 0.3);

            const animationGroupsClone = entries.animationGroups;

            console.log(animationGroupsClone);

            // Label animations.
            const animationGroups = {
                "idle": animationGroupsClone[0], 
                "moveForward": animationGroupsClone[2], 
                "moveForwardRight": animationGroupsClone[6], 
                "moveRight": animationGroupsClone[8], 
                "moveBackward": animationGroupsClone[1], 
                "moveBackwardRight": animationGroupsClone[4],
                "moveBackwardLeft": animationGroupsClone[3], 
                "moveLeft": animationGroupsClone[7],
                "moveForwardLeft": animationGroupsClone[5],
                "turnRight": animationGroupsClone[13],
                "turnLeft": animationGroupsClone[11],
                "shoot": animationGroupsClone[9]
            } as ICharacterAnimations;

            // Normalize animation speeds.
            animationGroups.moveForward.speedRatio = 1.35;
            animationGroups.moveBackward.speedRatio = 1.5;
            animationGroups.moveRight.speedRatio = 0.75;
            animationGroups.moveLeft.speedRatio = 0.75;
            animationGroups.moveForwardLeft.speedRatio = 1.2;
            animationGroups.moveForwardRight.speedRatio = 1.2;
            animationGroups.moveBackwardLeft.speedRatio = 1.25;
            animationGroups.moveBackwardRight.speedRatio = 1.25;
            animationGroups.turnLeft.speedRatio = 2;
            animationGroups.turnRight.speedRatio = 2;

            return [
                rootMesh,
                animationGroups,
                skeleton
            ];
        },
        "PlasmaPistol": (id: string) => {
            const entries = gunMeshImport.instantiateModelsToScene();
            const mesh = entries.rootNodes[0] as BABYLON.Mesh;
            mesh!.rotate(babylonjs.Vector3.Left(), (-1) * Math.PI - 0.4);
            mesh!.rotate(babylonjs.Vector3.Forward(), Math.PI/2);
            mesh!.rotate(babylonjs.Vector3.Up(), (-1) * Math.PI/2);
            mesh!.scaling = new BABYLON.Vector3(5, 5, 5);
            mesh.position = new BABYLON.Vector3(0, 10, 0);
            mesh!.setEnabled(true);
            mesh.id = id;

            return mesh;
        }
    };
}