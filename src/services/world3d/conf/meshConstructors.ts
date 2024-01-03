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
    
    const playerMeshImport: BABYLON.ISceneLoaderAsyncResult = (await babylonjs.SceneLoader.ImportMeshAsync(
        null,
        "assets/models/",
        "player.glb",
        scene
    ));
    playerMeshImport.meshes[0].setEnabled(false);

    return {
        "DirectionArrow": (id: string) => {
            const mesh = directionArrowMesh.clone(id, null);
            mesh!.setEnabled(true);
            scene.addMesh(mesh!);
            return mesh;
        },
        "Player": (id: string) => {
            const mesh = playerMeshImport.meshes[0].clone(id, null);
            mesh!.rotate(babylonjs.Vector3.Up(), (-1) * Math.PI / 2);
            mesh!.scaling = mesh!.scaling.scale(0.3);
            mesh!.setEnabled(true);
            scene.addMesh(mesh!);
            // Label animations.
            const animationGroups = {
                "idle": playerMeshImport.animationGroups[0], 
                "moveForward": playerMeshImport.animationGroups[2], 
                "moveForwardRight": playerMeshImport.animationGroups[6], 
                "moveRight": playerMeshImport.animationGroups[8], 
                "moveBackward": playerMeshImport.animationGroups[1], 
                "moveBackwardRight": playerMeshImport.animationGroups[4],
                "moveBackwardLeft": playerMeshImport.animationGroups[3], 
                "moveLeft": playerMeshImport.animationGroups[7],
                "moveForwardLeft": playerMeshImport.animationGroups[5],
                "shoot": playerMeshImport.animationGroups[9]
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
            return [
                mesh,
                animationGroups
            ];
        }
    };
}