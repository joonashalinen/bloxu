import { AssetContainer, Scene, SceneLoader } from "@babylonjs/core";


/**
 * Provides methods for loading 
 * different types of assets into World3D 
 * over the network.
 */
export default class AssetLoader {
    modelCache: {[fileName: string]: AssetContainer} = {};
    modelPaths: {[fileName: string]: string} = {};

    constructor(
        public assetsFolderPath: string,
        public scene: Scene) {
        
    }

    /**
     * Load a model with the given file name.
     */
    async loadModelFromFile(fileName: string) {
        if (this.modelCache[fileName] === undefined) {
            this.modelCache[fileName] = (await SceneLoader.LoadAssetContainerAsync(
                this.assetsFolderPath + "models/",
                fileName,
                this.scene
            ));
            this.modelCache[fileName].rootNodes[0].setEnabled(false);
        }
        return this.modelCache[fileName];
    }

    /**
     * Load model with the given type name.
     */
    async loadModel(type: string) {
        const path = this.modelPaths[type];
        return await this.loadModelFromFile(path);
    }

    /**
     * Get previously loaded model with the given type name.
     */
    getModel(type: string) {
        const path = this.modelPaths[type];
        return this.modelCache[path];
    }
}