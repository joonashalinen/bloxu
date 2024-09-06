import { Mesh, TransformNode, Vector2, Vector3 } from "@babylonjs/core";
import IMenu from "./IMenu";
import Selector from "../items/Selector";

/**
 * Base implementation for IMenu.
 */
export default class Menu extends Selector implements IMenu {
    followedNode: TransformNode;
    offset: Vector3 = new Vector3(0, 0, 0);
    visualsEnabled: boolean = true;
    createFollowVector: (passedTime: number, absoluteTime: number) => Vector3 = 
        (passedTime, absoluteTime) => this.followedNode.absolutePosition.clone();
    
    constructor() {
        super();
        this._menu = this;
    }

    activate(): void {
        if (this.isActive) return;
        super.activate();
        if (this.visualsEnabled) this.transformNode.setEnabled(true);
    }

    deactivate(): void {
        if (!this.isActive) return;
        super.deactivate();
        this.transformNode.setEnabled(false);
    }

    follow(other: TransformNode): void {
        this.followedNode = other;
    }

    doOnTick(passedTime: number, absoluteTime: number): void {
        if (this.followedNode !== undefined && this.transformNode !== undefined) {
            this.transformNode.setAbsolutePosition(
                this.createFollowVector(passedTime, absoluteTime));
        }
    }

    point(position: Vector2): void {
        
    }

    destroy(): void {
        if (this.transformNode !== undefined) {
            this.transformNode.getScene().removeMesh(this.transformNode as Mesh);
            this.transformNode.setEnabled(false);
            this.transformNode.dispose();
        }
    }
}