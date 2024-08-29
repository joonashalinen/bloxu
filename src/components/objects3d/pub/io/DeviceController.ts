import ObjectController from "./ObjectController";
import Device from "../Device";
import { Axis, Quaternion, Vector2, Vector3 } from "@babylonjs/core";
import DVector2 from "../../../graphics3d/pub/DVector2";
import DeviceState from "./DeviceState";

/**
 * An input controller for a Device that is meant to 
 * provide different modes of controlling the Device.
 */
export default class DeviceController extends ObjectController {
    
    constructor(public device: Device) {
        super(device);
        this.targetState = new DeviceState(device);
    }

    move(direction: DVector2) {
        const stateBefore = this.targetState.extract(
            ["perpetualMotionDirection", "absolutePosition"]);

        const direction3D = new Vector3(direction.x, 0, direction.y);

        // Vector between camera and target.
        const betweenCameraAndTarget = this.device.transformNode.getAbsolutePosition()
            .subtract(this.device.transformNode.getScene().activeCamera.position);

        // Project to x-z-plane.
        const betweenCameraAndTarget2D = new Vector2(
            betweenCameraAndTarget.x,
            betweenCameraAndTarget.z
        );

        // We want to rotate by 90 degrees left so that the angle is 
        // in relation to the z-axis and not the x-axis. 
        // We also want to reverse the sign to make the angle clockwise 
        // rather than anticlockwise.
        // We do these modifications because these are the conventions 
        // for rotation coordinates in babylonjs.
        const cameraAngle = (-1) * (Math.atan2(
            betweenCameraAndTarget2D.y, betweenCameraAndTarget2D.x) - Math.PI/2);

        const relativeDirection = direction3D.rotateByQuaternionToRef(
            Quaternion.RotationAxis(Axis.Y, cameraAngle),
            new Vector3()
        );
        this.device.setPerpetualMotionDirection(relativeDirection);

        const stateAfter = this.targetState.extract(
            ["perpetualMotionDirection", "absolutePosition"]);
        return {before: stateBefore, after: stateAfter};
    }
}