import { AbstractMesh, MeshBuilder, Vector3 } from "@babylonjs/core";
import CloudySky from "../../../components/graphics3d/pub/backgrounds/CloudySky";
import ILiveEnvironment from "../../../components/graphics3d/pub/ILiveEnvironment";

export interface IBackgrounds {
    Default: () => ILiveEnvironment,
    [name: string]: () => ILiveEnvironment
};

export default function createBackgrounds(meshConstructors: {[name: string]: Function}) {
    return {
        "Default": () => new CloudySky(
            meshConstructors["Background::cloudPrototype"]("default"),
            {
                minBounds: new Vector3(-200, -50, -200),
                maxBounds: new Vector3(200, -40, 200),
                minClusterBounds: new Vector3(-10, -2, -10),
                maxClusterBounds: new Vector3(10, 2, 10),
                minCloudScaling: new Vector3(0.2, 0.2, 0.2),
                maxCloudScaling: new Vector3(5, 5, 5),
                clustersNum: 50,
                maxCloudsPerCluster: 5,
                minCloudVisibility: 0.3,
                maxCloudVisibility: 1,
                windVelocity: 0.2
            }
        )
    };
}