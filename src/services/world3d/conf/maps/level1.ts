import { Scene } from "@babylonjs/core";
import level from "./templates/level";
import ObjectRegistry from "../../../../components/objects3d/pub/ObjectRegistry";

type MeshConstructors = {[name: string]: Function};

export default async function level1(
    scene: Scene, 
    meshConstructors: MeshConstructors,
    objects: ObjectRegistry) {
    const rootMesh = await level("level1-map", scene, meshConstructors, objects);
    return rootMesh;
}