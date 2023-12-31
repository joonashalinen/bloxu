import { Engine, Matrix, Mesh, PointerEventTypes, Scene, TransformNode, Vector2, Vector3 } from "@babylonjs/core";
import EventEmitter from "../../events/pub/EventEmitter";

/**
 * Represents the 2D vector that is formed 
 * between a given Mesh's projection on to the screen
 * and the mouse pointer. This vector can be thought of as a 
 * 2D 'leash' between the mouse pointer and the Mesh.
 */
export default class MeshLeash2D {
    emitter = new EventEmitter();
    lastLeash: Vector2;
    scene: Scene;
    engine: Engine;

    constructor(public mesh: TransformNode) {
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
        // Coordinates of the mesh when projected to the 2D screen.
        const meshPositionOnScreen3D = Vector3.Project(
            this.mesh.getAbsolutePosition(),
            Matrix.IdentityReadOnly,
            this.scene.getTransformMatrix(),
            this.scene.activeCamera.viewport.toGlobal(
                this.engine.getRenderWidth(),
                this.engine.getRenderHeight(),
            )
        );
        const meshPositionOnScreen = new Vector2(
            meshPositionOnScreen3D.x,
            meshPositionOnScreen3D.y,
        );

        const leash = mousePosition.subtract(meshPositionOnScreen);
        this.lastLeash = leash;

        this.emitter.trigger("change", [{
            meshPositionOnScreen: meshPositionOnScreen,
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