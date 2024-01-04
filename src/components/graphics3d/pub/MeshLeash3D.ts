import { Engine, GroundMesh, Matrix, Mesh, PointerEventTypes, Scene, TransformNode, Vector2, Vector3 } from "@babylonjs/core";
import EventEmitter from "../../events/pub/EventEmitter";

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

    constructor(public mesh: TransformNode, public leashPlane: GroundMesh) {
        this.scene = mesh.getScene();
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
        // Project the mouse position to the plane.
        const pickedPoint = this.scene.pick(mousePosition.x, mousePosition.y).pickedPoint;
        const pickedPoint2D = new Vector2(pickedPoint!.x, pickedPoint!.z);
        const meshPosition2D = new Vector2(
            this.mesh.getAbsolutePosition().x,
            this.mesh.getAbsolutePosition().z,
        );
        this.lastMeshPositionOnScreen = meshPosition2D;

        const leash = pickedPoint2D.subtract(meshPosition2D);
        this.lastLeash = leash;

        console.log(leash);

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