import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders"
import AssetLoader from "../prv/AssetLoader";
import MeshSize from "../../../components/graphics3d/pub/MeshSize";

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
    "shoot": BABYLON.AnimationGroup,
    "jump": BABYLON.AnimationGroup,
    "hover": BABYLON.AnimationGroup
}

export interface AnimatedMesh {
    mesh: BABYLON.Mesh,
    animations: ICharacterAnimations,
    skeleton: BABYLON.Skeleton
}

export default async function(babylonjs: typeof BABYLON, scene: BABYLON.Scene) {
    const assetLoader = new AssetLoader("assets/", scene);
    
    assetLoader.modelPaths = {
        "Blocks::dirt": "blocks/dirt.glb",
        "Blocks::grassyDirt": "blocks/grassy_dirt.glb",
        "Blocks::stone": "blocks/stone.glb",
        "Background::cloudPrototype": "cloud_prototype.glb"
    };

    const directionArrowMesh = (await assetLoader.loadModelFromFile("direction_arrow.glb")).meshes[0];
    const playerMeshImport = (await assetLoader.loadModelFromFile("player.glb"));
    const skyboxImport = (await assetLoader.loadModelFromFile("skybox.glb"));
    const gunMeshImport = (await assetLoader.loadModelFromFile("plasma_pistol.glb"));
    assetLoader.loadModel("Blocks::dirt");
    assetLoader.loadModel("Blocks::grassyDirt");
    assetLoader.loadModel("Blocks::stone");
    assetLoader.loadModel("Background::cloudPrototype");

    function plainConstructor(type: string, id?: string) {
        const modelImport = assetLoader.getModel(type);
        const entries = modelImport.instantiateModelsToScene();
        const root = entries.rootNodes[0] as BABYLON.TransformNode;
        const mesh = root.getChildMeshes()[0];
        root.scaling = new BABYLON.Vector3(1, 1, 1);
        root.rotation = new BABYLON.Vector3(0, 0, 0);
        mesh.scaling = new BABYLON.Vector3(1, 1, 1);
        mesh.rotation = new BABYLON.Vector3(0, 0, 0);
        root.setEnabled(false);
        if (typeof id === "string") {
            mesh.id = id;
        }
        return mesh;
    }

    return {
        "DirectionArrow": (id: string) => {
            const mesh = directionArrowMesh.clone(id, null);
            mesh!.setEnabled(true);
            scene.addMesh(mesh!);
            return mesh;
        },
        "Player": (id: string, pistolMesh: BABYLON.Mesh) => {
            
            const entries = playerMeshImport
                .instantiateModelsToScene((name: string) => {
                return id + "-" + name;
            });
            const rootMesh = entries.rootNodes[0] as BABYLON.Mesh;
            const characterMesh = rootMesh.getChildren()[0] as BABYLON.Mesh;

            rootMesh!.position = new BABYLON.Vector3(0, 0, 0);
            rootMesh!.scaling = rootMesh!.scaling.scale(0.3);
            rootMesh!.setEnabled(false);
            characterMesh.id = id;
            rootMesh.id = "Root:" + id;

            const skeleton = entries.skeletons[0];
            // @ts-ignore
            skeleton.position = new BABYLON.Vector3(0, 0, 0);
            // @ts-ignore
            skeleton.scaling = new BABYLON.Vector3(0.3, 0.3, 0.3);

            pistolMesh.attachToBone(
                skeleton.bones[23], 
                rootMesh.getChildren()[0] as BABYLON.Mesh
            );
            pistolMesh.setEnabled(true);

            const animationGroupsClone = entries.animationGroups;
            animationGroupsClone.forEach((animation) => {
                animation.enableBlending = true;
                animation.blendingSpeed = 0.2;
            });

            // Label animations.
            const animationGroups = {
                "idle": animationGroupsClone[2], 
                "moveForward": animationGroupsClone[4], 
                "moveForwardRight": animationGroupsClone[10], 
                "moveRight": animationGroupsClone[12], 
                "moveBackward": animationGroupsClone[3], 
                "moveBackwardRight": animationGroupsClone[8],
                "moveBackwardLeft": animationGroupsClone[7], 
                "moveLeft": animationGroupsClone[11],
                "moveForwardLeft": animationGroupsClone[9],
                "turnRight": animationGroupsClone[17],
                "turnLeft": animationGroupsClone[15],
                "shoot": animationGroupsClone[13],
                "jump": animationGroupsClone[5],
                "hover": animationGroupsClone[0]
            } as ICharacterAnimations;

            // Set unique animation speeds for each animation.
            animationGroups.moveForward.speedRatio = 1.35;
            animationGroups.moveBackward.speedRatio = 1.5;
            animationGroups.moveRight.speedRatio = 0.75;
            animationGroups.moveLeft.speedRatio = 0.75;
            animationGroups.moveForwardLeft.speedRatio = 1.2;
            animationGroups.moveForwardRight.speedRatio = 1.2;
            animationGroups.moveBackwardLeft.speedRatio = 1.25;
            animationGroups.moveBackwardRight.speedRatio = 1.25;
            animationGroups.turnLeft.speedRatio = 2.5;
            animationGroups.turnRight.speedRatio = 2.5;
            animationGroups.shoot.speedRatio = 2;
            animationGroups.jump.speedRatio = 0.4;

            return {
                mesh: rootMesh,
                animations: animationGroups,
                skeleton: skeleton
            };
        },
        "PlasmaPistol": (id: string) => {
            const entries = gunMeshImport.instantiateModelsToScene();
            const mesh = entries.rootNodes[0] as BABYLON.Mesh;
            mesh!.rotate(babylonjs.Vector3.Left(), (-1) * Math.PI - 0.4);
            mesh!.rotate(babylonjs.Vector3.Forward(), Math.PI/2);
            mesh!.rotate(babylonjs.Vector3.Up(), (-1) * Math.PI/2);
            mesh!.scaling = new BABYLON.Vector3(5, 5, 5);
            mesh.position = new BABYLON.Vector3(0, 10, 0);
            mesh.id = id;

            return mesh;
        },
        "SkyBox": () => {
            const entries = skyboxImport.instantiateModelsToScene();
            const rootMesh = entries.rootNodes[0] as BABYLON.TransformNode;
            rootMesh.setEnabled(true);
            rootMesh.position = new BABYLON.Vector3(0, 0, 0);
            //rootMesh.rotate(BABYLON.Vector3.Up(), 1.7);
            rootMesh.translate(BABYLON.Vector3.Up(), -200);
            return rootMesh;
        },
        "Cube": (id: string, size: number) => {
            // Create cube mesh.
            const cube = BABYLON.MeshBuilder.CreateBox(id, {size: size}, scene);
            // Set mesh color.
            const material = new BABYLON.StandardMaterial("FloatingCube:mesh:material?" + id, scene);
            const color = new BABYLON.Color3(1, 1, 1);
            material.diffuseColor = color;
            material.ambientColor = color;
            material.specularColor = color;
            // material.emissiveColor = new Color3(0.04, 0.09, 0.16);
            cube.material = material;
            return cube;
        },
        "Blocks::dirt": () => plainConstructor("Blocks::dirt"),
        "Blocks::grassyDirt": () => plainConstructor("Blocks::grassyDirt"),
        "Blocks::stone": () => plainConstructor("Blocks::stone"),
        "Interactables::portal": (id: string) => {
            function createMaterial(name: string) {
                const material = new BABYLON.StandardMaterial(name, scene);
                const color = new BABYLON.Color3(0, 0, 0.1);
                material.diffuseColor = color;
                return material;
            }

            function createTorusWithAnimationStartFrame(startFrame: number) {
                const torus = BABYLON.MeshBuilder.CreateTorus(
                    "Interactables::portalRing" + startFrame, 
                    {thickness: 0.25, diameter: 1.5,  tessellation: 64}, scene);
                torus.rotate(BABYLON.Vector3.Left(), (1 / 2) * Math.PI);
                torus.material = createMaterial("Interactables::portalRingMaterial");

                function animate(name: string, property: string, 
                    from: number | BABYLON.Vector3, 
                    to: number | BABYLON.Vector3,
                    startFrame = 0,
                    endFrame = 10) {
                    const frameRate = 10;
                    const expand = new BABYLON.Animation(name, property, 
                        frameRate,
                        from instanceof BABYLON.Vector3 ? 
                            BABYLON.Animation.ANIMATIONTYPE_VECTOR3 : 
                            BABYLON.Animation.ANIMATIONTYPE_FLOAT, 
                        BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        
                    expand.setKeys([
                        {frame: startFrame, value: from},
                        {frame: endFrame, value: to}
                    ]);
    
                    torus.animations.push(expand);
                }

                animate("Interactables::portalExpand" + startFrame, "scaling", 
                    new BABYLON.Vector3(0.001, 0.001, 0.001),
                    new BABYLON.Vector3(1, 1, 1), startFrame);

                animate("Interactables::portalVisibility" + startFrame, "visibility", 1, 0.001, startFrame);

                return torus;
            }

            
            const parent = BABYLON.MeshBuilder.CreateBox("Interactables::portal?" + id, 
                {width: 2, depth: 0.5, height: 2}, scene);
            parent.id = "Interactables::portal?" + id;
            parent.visibility = 0;

            const toruses = [0, 0, 0].map(createTorusWithAnimationStartFrame);
            const startFrames = [0, 4, 8];
            toruses.forEach((torus: BABYLON.Mesh, i: number) => {
                torus.parent = parent;
                const animatable = scene.beginAnimation(torus, 0, 10, true, 0.5);
                animatable.goToFrame(startFrames[i]);
            });

            const body = BABYLON.MeshBuilder.CreateDisc(
                "Interactables::portalFrame", 
                {radius: 1, tessellation: 64}, scene);
            body.material = createMaterial("Interactables::portalBodyMaterial");
            body.visibility = 0.4;
            body.parent = parent;

            const frame = BABYLON.MeshBuilder.CreateTorus(
            "Interactables::portalFrame", 
            {thickness: 0.1, diameter: 2, tessellation: 64}, scene);
            frame.rotate(BABYLON.Vector3.Left(), (1 / 2) * Math.PI);
            frame.material = createMaterial("Interactables::portalFrameMaterial");
            frame.visibility = 0.3;
            frame.parent = parent;

            return parent;
        },
        "Background::cloudPrototype": (id: string) => {
            const cloud = plainConstructor("Background::cloudPrototype",
                "Background::cloudPrototype?" + id);
            const material = new BABYLON.StandardMaterial(cloud.name + ":material", scene);
            const color = new BABYLON.Color3(1, 1, 1);
            material.diffuseColor = color;
            material.specularColor = color;
            material.ambientColor = color;
            cloud.material = material;
            return cloud;
        },
    };
}