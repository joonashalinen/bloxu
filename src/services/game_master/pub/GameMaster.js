import EventEmitter from "../../../components/events/pub/EventEmitter";
/**
 * Class that contains the operations and state
 * of the LocalGameMaster service.
 */
export default class GameMaster {
    constructor() {
        this.emitter = new EventEmitter();
        this.eventHandlers = {};
        this.initialized = false;
    }
    /**
     * Create a new standard-sized cube island in the world
     * at the given position.
     */
    createCubeIsland(id, position) {
        this.emitter.trigger("message", [{
                recipient: "world3d",
                message: {
                    type: "request",
                    message: {
                        type: "createObject",
                        args: [id, "GameMaster.CubeIsland", {
                                boundArgs: [id, position],
                                f: function (id, position) {
                                    return [id, new this.babylonjs.Vector3(position.x, position.y, position.z)];
                                }
                            }]
                    }
                }
            }]);
    }
    /**
     * Initialization procedure for the LocalGameMaster service.
     */
    initialize() {
        // ### Create initial cube islands the players will stand on. ### 
        // Register the constructor for a standard floating cube island.
        this.emitter.trigger("message", [{
                recipient: "world3d",
                message: {
                    type: "request",
                    message: {
                        type: "registerObjectType",
                        args: ["GameMaster.CubeIsland", {
                                boundArgs: [],
                                f: function (id, position) {
                                    var box = this.babylonjs.MeshBuilder.CreateBox(id, { size: 3 }, this.scene);
                                    box.position.x = position.x;
                                    box.position.y = position.y;
                                    box.position.z = position.z;
                                    return new this.babylonjs.PhysicsAggregate(box, this.babylonjs.PhysicsShapeType.BOX, { mass: 0 }, this.scene);
                                }
                            }]
                    }
                }
            }]);
        // Create the cube islands the players will spawn on.
        this.createCubeIsland("cubeIsland1", { x: 0, y: 0, z: 0 });
        this.createCubeIsland("cubeIsland2", { x: 0, y: 0, z: 20 });
        this.initialized = true;
        return this;
    }
}
//# sourceMappingURL=GameMaster.js.map