import { Scene, Mesh } from "@babylonjs/core";
import ObjectManager from "../../../../components/objects3d/pub/ObjectManager";
import { TMeshConstructors } from "../meshConstructors";
import level from "./templates/level";

export type TMapGenerator = (scene: Scene, meshConstructors: TMeshConstructors,
    objects: ObjectManager, globals: {[name: string]: unknown}) => Promise<Mesh>;

export type TMapGenerators = {[mapName: string]: TMapGenerator};

const maps: TMapGenerators = {
    "level1": (...args) => level("level1", ...args),
    "level2": (...args) => level("level2", ...args),
    "level3": (...args) => level("level3", ...args),
    "level4": (...args) => level("level4", ...args),
    "level5": (...args) => level("level5", ...args),
    "level6": (...args) => level("level6", ...args),
    "level7": (...args) => level("level7", ...args),
};

export default maps