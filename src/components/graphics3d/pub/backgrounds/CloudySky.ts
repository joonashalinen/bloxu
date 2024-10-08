import { AbstractMesh, TransformNode, Vector3, MeshBuilder } from "@babylonjs/core";
import ILiveEnvironment from "../ILiveEnvironment";

export type TCloudySkyOptions = {
    minBounds: Vector3,
    maxBounds: Vector3,
    minClusterBounds: Vector3,
    maxClusterBounds: Vector3,
    minCloudScaling: Vector3,
    maxCloudScaling: Vector3,
    clustersNum: number;
    maxCloudsPerCluster: number;
    minCloudVisibility: number;
    maxCloudVisibility: number;
    windVelocity: number;
};

/**
 * A sky with clusters of clouds that move.
 */
export default class CloudySky implements ILiveEnvironment {
    clusters: AbstractMesh[] = [];
    wrapper: AbstractMesh;

    constructor(public cloudPrototype: AbstractMesh, public options: TCloudySkyOptions) {
        this.wrapper = MeshBuilder.CreateBox("CloudySky:wrapper", {size: 1});
        this.wrapper.visibility = 0;
    }

    generate(): void {
        const worldBoundsSize = this.options.maxBounds.subtract(this.options.minBounds);
        for (let i = 0; i < this.options.clustersNum; i++) {
            // Create cluster parent node.
            const cluster = MeshBuilder.CreateBox("CloudySky:cluster?" + i, {size: 1},
                this.cloudPrototype.getScene());
            cluster.visibility = 0;
            this.wrapper.addChild(cluster);
            cluster.setAbsolutePosition(new Vector3(
                this.options.minBounds.x + worldBoundsSize.x * Math.random(),
                this.options.minBounds.y + worldBoundsSize.y * Math.random(),
                this.options.minBounds.z + worldBoundsSize.z * Math.random(),
            ));
            // Create clouds in cluster.
            const clusterBoundsSize = this.options.maxClusterBounds
                .subtract(this.options.minClusterBounds);
            const cloudScalingRange = this.options.maxClusterBounds
                .subtract(this.options.minClusterBounds);
            const cloudVisibilityRange = this.options.maxCloudVisibility - this.options.minCloudVisibility;
            const cloudsNum = parseInt((Math.random() * this.options.maxCloudsPerCluster).toFixed(0));
            for (let i = 0; i < cloudsNum; i++) {
                const cloud = this.cloudPrototype.clone(cluster.name + ":cloud?" + i, cluster);
                cloud.position = new Vector3(
                    this.options.minClusterBounds.x + clusterBoundsSize.x * Math.random(),
                    this.options.minClusterBounds.y + clusterBoundsSize.y * Math.random(),
                    this.options.minClusterBounds.z + clusterBoundsSize.z * Math.random(),
                );
                cloud.scaling = new Vector3(
                    this.options.minCloudScaling.x + cloudScalingRange.x * Math.random(),
                    this.options.minCloudScaling.y + cloudScalingRange.y * Math.random(),
                    this.options.minCloudScaling.z + cloudScalingRange.z * Math.random(),
                );
                cloud.visibility = this.options.minCloudVisibility + cloudVisibilityRange * Math.random();
            }
            // Save cluster.
            this.clusters.push(cluster);
        }
    }

    destroy(): void {
        this.clusters.forEach((cluster) => {
            cluster.setEnabled(false);
            cluster.getScene().removeTransformNode(cluster);
        });
    }

    doOnTick(passedTime: number, absoluteTime: number): void {
        const currentAbsolutePosition = this.wrapper.absolutePosition;
        // Make the clouds wrap around to the maximum of the 
        // bounded area once they have reached the minimum bounds.
        if (currentAbsolutePosition.x >= this.options.minBounds.x) {
            currentAbsolutePosition.x -= (passedTime / 1000) * this.options.windVelocity
        } else {
            currentAbsolutePosition.x = this.options.maxBounds.x;                
        }
        this.wrapper.setAbsolutePosition(currentAbsolutePosition);
    }
}