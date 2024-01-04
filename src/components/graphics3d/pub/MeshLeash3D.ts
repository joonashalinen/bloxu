import { AbstractMesh, Engine, GroundMesh, Matrix, Mesh, PointerEventTypes, Scene, TransformNode, Vector2, Vector3 } from "@babylonjs/core";
import EventEmitter from "../../events/pub/EventEmitter";
import Movable from "../../objects3d/pub/Movable";
import Follower from "../../objects3d/pub/Follower";

/**
 * Like MeshLeash2D, except instead of the leash existing 
 * on the camera screen, it exists on a given 3D plane. 
 * The current implementation only support planes 
 * that are parallel with the x-z-plane.
 */
export default class MeshLeash3D {
    emitter = new EventEmitter();
    lastLeash: Vector2;
    lastMeshPositionOnScreen: Vector2;
    scene: Scene;
    engine: Engine;

    constructor(public transformNode: TransformNode, public leashPlane: GroundMesh) {
        this.scene = this.transformNode.getScene();
        this.engine = this.scene.getEngine();
    }

    /**
     * Makes the leash automatically update itself 
     * whenever the mouse moves on the screen.
     */
    enableAutoUpdate() {
        // Update the leash whenever the mouse moves.
        this.scene.onPointerObservable.add((pointerInfo) => {
            if (pointerInfo.type === PointerEventTypes.POINTERMOVE) {
                const mousePosition = new Vector2(
                    this.scene.pointerX,
                    this.scene.pointerY
                );
                this.update(mousePosition);
            }
        });
    }

    /**
     * Update the leash position.
     */
    update(mousePosition: Vector2) {
        // We want to update the leash plane position first 
        // to match the position of the target mesh, since it may have changed.
        this.leashPlane.position = this.transformNode.position.clone();

        // Project the mouse position to the plane.
        const pickedPoint = this.scene.pick(mousePosition.x, mousePosition.y, (mesh: AbstractMesh) => {
            return mesh === this.leashPlane;
        }).pickedPoint;
        const pickedPoint2D = new Vector2(pickedPoint!.x, pickedPoint!.z);
        const meshPosition2D = new Vector2(
            this.transformNode.getAbsolutePosition().x,
            this.transformNode.getAbsolutePosition().z,
        );
        this.lastMeshPositionOnScreen = meshPosition2D;

        const leash = pickedPoint2D.subtract(meshPosition2D);
        this.lastLeash = leash;

        this.emitter.trigger("change", [{
            meshPositionOnLeashPlane: meshPosition2D,
            mousePosition: mousePosition,
            leash: leash
        }]);

        return this;
    }

    /**
     * When the leash changes, i.e. the mouse moves.
     */
    onChange(handler: Function) {
        this.emitter.on("change", handler);
    }
}