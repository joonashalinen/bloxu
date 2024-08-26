import { Scene } from "@babylonjs/core";
import level from "./templates/level";
import ObjectManager from "../../../../components/objects3d/pub/ObjectManager";

type MeshConstructors = {[name: string]: Function};

export default async function level1(
    scene: Scene, 
    meshConstructors: MeshConstructors,
    objects: ObjectManager,
    globals: {[name: string]: unknown}) {
    const rootMesh = await level("level1-map", scene, meshConstructors, objects, globals);
    return rootMesh;
}