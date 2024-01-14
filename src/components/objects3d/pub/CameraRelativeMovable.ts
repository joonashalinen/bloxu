import { Axis, Camera, Quaternion, TransformNode, Vector2, Vector3 } from "@babylonjs/core";
import IMovable from "./IMovable";
import IObject from "./IObject";

/**
 * A movable object that moves in relation to the 
 * current camera's orientation around the y-axis.
 */
export default class CameraRelativeMovable implements IMovable, IObject {
    transformNode: TransformNode;
    direction: Vector3;

    constructor(public movable: IMovable & IObject, public camera: Camera) {
        this.transformNode = movable.transformNode;
    }

    /**
     * Move in given direction relative to the current orientation.
     */
    move(direction: Vector3) {
        this.direction = direction;

        // Vector between camera and target.
        const betweenCameraAndTarget = this.movable.transformNode.position
            .subtract(this.camera.position);

        // Project to x-z-plane.
        const betweenCameraAndTarget2D = new Vector2(
            betweenCameraAndTarget.x,
            betweenCameraAndTarget.z
        );

        // Rotation angle of camera around the y-axis.
        const cameraAngle = Math.atan2(
            betweenCameraAndTarget2D.y, 
            betweenCameraAndTarget2D.x
        );

        // Adjust the direction vector based on the current rotation angle.
        // We want movements to be relative to the orientation of the camera.
        const relativeDirection = direction.rotateByQuaternionToRef(
            Quaternion.RotationAxis(Axis.Y, cameraAngle - Math.PI/2),
            new Vector3()
        );
        return this.movable.move(relativeDirection);
    }
}