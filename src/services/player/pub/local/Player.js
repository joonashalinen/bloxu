import EventEmitter from "../../../../components/events/pub/EventEmitter";
/**
 * Class that contains the operations and state
 * of the LocalPlayer service.
 */
export default class Player {
    constructor() {
        this.emitter = new EventEmitter();
        this.eventHandlers = {
            "controllerDirectionChange": this.onControllerDirectionChange.bind(this)
        };
        this.initialized = false;
    }
    /**
     * Does what Player wants to do when the controller's
     * direction control has changed (for example, the thumb joystick of WASD keys).
     */
    onControllerDirectionChange(event) {
        if (this.initialized) {
            this.emitter.trigger("message", [{
                    recipient: "world3d",
                    message: {
                        type: "request",
                        message: {
                            type: "modifyObject",
                            args: ["player1Body", {
                                    boundArgs: [event.direction],
                                    f: function (direction, obj) {
                                        return obj.move(new this.babylonjs.Vector3(direction.x, 0, direction.y * (-1)));
                                    }
                                }]
                        }
                    }
                }]);
            return this;
        }
        else {
            return this;
        }
    }
    /**
     * Initialization procedure for the LocalPlayer service.
     */
    initialize() {
        // ### Create Player character. ### 
        // We are currently just using a movable box 
        // until a proper player character has been developed.
        // Create box with physics.
        this.emitter.trigger("message", [{
                recipient: "world3d",
                message: {
                    type: "request",
                    message: {
                        type: "createCustomObject",
                        args: ["nativePlayer1Body", {
                                boundArgs: [],
                                f: function () {
                                    var box = this.babylonjs.MeshBuilder.CreateBox("nativePlayer1Body", { size: 0.7 }, this.scene);
                                    box.position.y = 4;
                                    return new this.babylonjs.PhysicsAggregate(box, this.babylonjs.PhysicsShapeType.BOX, { mass: 0.1 }, this.scene);
                                }
                            }]
                    }
                }
            }]);
        // Make a movable box using the created box.
        this.emitter.trigger("message", [{
                recipient: "world3d",
                message: {
                    type: "request",
                    message: {
                        type: "createObject",
                        args: ["player1Body", "Movable", {
                                boundArgs: [],
                                f: function () {
                                    return [this.getObject("nativePlayer1Body")];
                                }
                            }]
                    }
                }
            }]);
        this.initialized = true;
        return this;
    }
}
//# sourceMappingURL=Player.js.map