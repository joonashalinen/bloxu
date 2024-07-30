import { Scene } from "@babylonjs/core";
import level from "./templates/level";

type MeshConstructors = {[name: string]: Function};

export default async function level1(scene: Scene, meshConstructors: MeshConstructors) {
    const rootMesh = await level("level1-map", scene, meshConstructors);
    return rootMesh;
}