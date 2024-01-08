import { GroundMesh, MeshBuilder, Quaternion, TransformNode, Vector2 } from "@babylonjs/core";
import MeshLeash3D from "../../graphics3d/pub/MeshLeash3D";
import DMeshLeash3D from "../../graphics3d/pub/DMeshLeash3D";
import EventEmitter from "../../events/pub/EventEmitter";
import IObject from "./IObject";
import IRotatable from "./IRotatable";
import IEventable from "../../events/pub/IEventable";
import IAutoUpdatable from "./IAutoUpdatable";

/**
 * Wrapper for a mesh to make it always face 
 * the mouse pointer.
 */
export default class MouseRotatable implements IAutoUpdatable, IObject, IRotatable {
    leash: MeshLeash3D;
    angle: number = 0;
    direction: Vector2 = new Vector2(0, 0);
    emitter = new EventEmitter();
    pickPlane: GroundMesh;
    endTurnTimeout: unknown;
    autoUpdateEnabled: boolean = false;

    constructor(public transformNode: TransformNode) {
        if (this.transformNode.getScene() === null) {
            throw new Error(`Mesh is not connected to a scene.`);
        }

        // Create plane we use for projecting mouse coordinates to 
        // 3D world coordinates.
        this.pickPlane = MeshBuilder.CreateGround(
            `MouseRotatable:pickPlane?${transformNode.id}`, 
            {
                width: 10000,
                height: 10000
            },
            transformNode.getScene()
        );
        this.pickPlane.visibility = 0;
        this.pickPlane.position = transformNode.position.clone();
        this.leash = new MeshLeash3D(transformNode, this.pickPlane);
    }

    /**
     * Enable automatically updating 
     * the mesh rotation whenever the mouse moves.
     */
    enableAutoUpdate() {
        if (!this.autoUpdateEnabled) {
            // Make the leash rotate when the mouse moves.
            this.leash.enableAutoUpdate();
            // Update the mesh when the leash changes (i.e. the mouse moves).
            this.leash.onChange((leash: DMeshLeash3D) => {
                if (this.autoUpdateEnabled) {
                    this.pointInDirection(leash.leash);
                    this.emitter.trigger("rotate", [leash]);   
                }
            });
        }
        return this;
    }

    disableAutoUpdate() {
        if (this.autoUpdateEnabled) {
            // Clear the timeout that tells us when 
            // turning has ended.
            if (this.endTurnTimeout !== undefined) {
                clearTimeout(this.endTurnTimeout as number);
            }
            this.autoUpdateEnabled = false;
        }
        return this;
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
        // Clear timeout meant to end turning once 
        // no turning is happening anymore. We want to reset 
        // the timeout, since because we are here, then 
        // turning is clearly still happening.
        if (this.endTurnTimeout !== undefined) {
            clearTimeout(this.endTurnTimeout as number);
        }

        // Timeout that successfully goes once there has been no
        // turning for 0.1 seconds.
        this.endTurnTimeout = setTimeout(() => {
            this.emitter.trigger("rotateEnd");
        }, 100);

        this.angle = angle;
        this.direction = new Vector2(Math.cos(this.angle), Math.sin(this.angle));
        this.transformNode.rotationQuaternion = Quaternion.FromEulerAngles(0, this.angle, 0);
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