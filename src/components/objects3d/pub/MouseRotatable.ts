import { Camera, Mesh, Node, Quaternion, Scene, TransformNode, Vector2 } from "@babylonjs/core";
import MeshLeash2D from "../../graphics3d/pub/MeshLeash2D";
import DMeshLeash2D from "../../graphics3d/pub/DMeshLeash2D";
import EventEmitter from "../../events/pub/EventEmitter";
import IObject from "./IObject";
import IRotatable from "./IRotatable";

/**
 * Wrapper for a mesh to make it always face 
 * the mouse pointer.
 */
export default class MouseRotatable implements IObject, IRotatable {
    leash: MeshLeash2D;
    angle: number = 0;
    direction: Vector2 = new Vector2(0, 0);
    emitter = new EventEmitter();

    constructor(public transformNode: TransformNode) {
        if (this.transformNode.getScene() === null) {
            throw new Error(`Mesh is not connected to a scene.`);
        }
        this.leash = new MeshLeash2D(transformNode);
    }

    /**
     * Enable automatically updating 
     * the mesh rotation whenever the mouse moves.
     */
    enableAutoUpdate() {
        // Make the leash rotate when the mouse moves.
        this.leash.enableAutoUpdate();
        // Update the mesh when the leash changes (i.e. the mouse moves).
        this.leash.onChange((leash: DMeshLeash2D) => {
            this.setMeshRotation(leash.leash);
            this.emitter.trigger("rotate", [leash]);
        });
    }

    /**
     * Make the mesh point towards the given mouse position.
     */
    update(mousePos: Vector2) {
        this.leash.update(mousePos);
        this.setMeshRotation(this.leash.lastLeash);
    }

    /**
     * Rotate the mesh based on the given leash.
     */
    setMeshRotation(leash: Vector2) {
        const scene = this.transformNode.getScene();
        const cameraPosition = scene!.activeCamera!.position;
        // Angle of the camera position in relation to the x-axis within the x-z plane.
        const cameraAngle = Math.atan2(cameraPosition.z, cameraPosition.x);
        // Angle of the leash relative to the x-axis coming from 
        // the mesh on the 2D screen.
        const leashAngle = Math.atan2(leash.y, leash.x);
        const angle = leashAngle - cameraAngle + (Math.PI / 2);
        this.setAngle(angle);
    }

    /**
     * Set the mesh rotation based on the given angle.
     */
    setAngle(angle: number) {
        this.angle = angle;
        this.direction = new Vector2(Math.cos(this.angle), Math.sin(this.angle));
        this.transformNode.rotationQuaternion = Quaternion.FromEulerAngles(0, this.angle, 0);
    }
}