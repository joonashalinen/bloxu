import { Vector2, GroundMesh, MeshBuilder, Quaternion } from "@babylonjs/core";
import MeshLeash3D from "../../graphics3d/pub/MeshLeash3D";
import Object from "./Object";

/**
 * An input controller for an object that
 * enables input actions on the horizontal xz-plane.
 */
export default class HorizontalObjectController {
    leash: MeshLeash3D;
    angle: number = 0;
    direction: Vector2 = new Vector2(0, 0);
    pickPlane: GroundMesh;

    constructor(public object: Object) {
        if (this.object.transformNode.getScene() === null) {
            throw new Error(`Mesh is not connected to a scene.`);
        }

        // Create plane we use for projecting mouse coordinates to 
        // 3D world coordinates.
        this.pickPlane = MeshBuilder.CreateGround(
            `MouseRotatable:pickPlane?${this.object.transformNode.id}`, 
            {
                width: 10000,
                height: 10000
            },
            this.object.transformNode.getScene()
        );
        this.pickPlane.visibility = 0;
        this.pickPlane.position = this.object.transformNode.position.clone();
        this.leash = new MeshLeash3D(this.object.transformNode, this.pickPlane);
    }

    /**
     * Make the mesh point towards the given mouse position.
     */
    update(mousePos: Vector2) {
        this.leash.update(mousePos);
        this.pointInDirection(this.leash.lastLeash);
        return this;
    }

    /**
     * Rotate the mesh based on the given direction vector along 
     * the x-z-plane.
     */
    pointInDirection(direction: Vector2) {
        const directionAngle = Math.atan2(direction.y, direction.x);
        this.setAngle((-1) * directionAngle - Math.PI);
        return this;
    }

    /**
     * Set the mesh rotation based on the given angle.
     */
    setAngle(angle: number) {
        this.angle = angle;
        this.direction = new Vector2(Math.cos(this.angle), Math.sin(this.angle));
        this.object.transformNode.rotationQuaternion = Quaternion.FromEulerAngles(0, this.angle, 0);
        return this;
    }

    /**
     * Calculate the orientation angle that would result from the given mouse position 
     * without actually updating the MouseRotatable's state in any way.
     */
    calculateAngle(mousePos: Vector2) {
        this.leash.update(mousePos);
        const direction = this.leash.lastLeash;
        const directionAngle = Math.atan2(direction.y, direction.x);
        return (-1) * directionAngle - Math.PI;
    }
}