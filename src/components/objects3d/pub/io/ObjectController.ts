import { Vector2, MeshBuilder, ArcRotateCamera } from "@babylonjs/core";
import MeshLeash3D from "../../../graphics3d/pub/MeshLeash3D";
import Object from "../Object";
import DVector2 from "../../../graphics3d/pub/DVector2";
import ObjectState from "./ObjectState";
import Controller from "../../../controls/pub/Controller";

/**
 * An input controller for an Object that is meant to 
 * provide different modes of controlling the Object.
 */
export default class ObjectController extends Controller {
    leash: MeshLeash3D;
    useDiscreteCameraRotation: boolean = true;
    discreteCameraRotation: number = Math.PI / 2;
    cameraRotationKey: string = "f";

    constructor(public object: Object) {
        super();
        this.targetState = new ObjectState(object);
        if (this.object.transformNode.getScene() === null) {
            throw new Error(`Mesh is not connected to a scene.`);
        }

        // Create plane we use for projecting mouse coordinates to 
        // 3D world coordinates.
        const leashPlane = MeshBuilder.CreateGround(
            `ObjectController:pickPlane?${this.object.transformNode.id}`, 
            {
                width: 10000,
                height: 10000
            },
            this.object.transformNode.getScene()
        );
        leashPlane.visibility = 0;
        leashPlane.position = this.object.transformNode.position.clone();
        this.leash = new MeshLeash3D(this.object.transformNode, leashPlane);
    }

    /**
     * Makes the controlled object look in the direction of the pointer.
     */
    override point(pointerPosition: DVector2, pointerIndex: number) {
        return this._doWithStateExtractions("point", () => {
            const pointerPositionVector = new Vector2(
                pointerPosition.x, pointerPosition.y);
            this.leash.update(pointerPositionVector);
            const direction = this.leash.lastLeash;
            // We want to rotate by 90 degrees left so that the angle is 
            // in relation to the z-axis and not the x-axis. 
            // We also want to reverse the sign to make the angle clockwise 
            // rather than anticlockwise.
            // We do these modifications because these are the conventions 
            // for rotation coordinates in babylonjs.
            const baseDirectionAngle = (-1) * (Math.atan2(direction.y, direction.x) - Math.PI/2);
            // Math.atan2 will switch signs past 180 degrees so we have to 
            // transform to positive angles.
            const directionAngle = baseDirectionAngle >= 0 ? baseDirectionAngle : 
                2*Math.PI + baseDirectionAngle;
            this.object.setHorizontalAngle(directionAngle);
        });
    }

    override releaseKey(key: string, keyControllerIndex: number) {
        return this._doWithStateExtractions("releaseKey", () => {
            if (this.useDiscreteCameraRotation && 
                key.toLowerCase() === this.cameraRotationKey) {
                const camera = this.object.transformNode.getScene().activeCamera;
                if (camera instanceof ArcRotateCamera) {
                    camera.alpha += this.discreteCameraRotation;
                }
            }
        });
    }
}