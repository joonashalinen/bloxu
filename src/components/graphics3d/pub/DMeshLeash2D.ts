import * as babylonjs from "@babylonjs/core";

export default interface DMeshLeash2D {
    meshPositionOnScreen: babylonjs.Vector2,
    mousePosition: babylonjs.Vector2,
    leash: babylonjs.Vector2
}