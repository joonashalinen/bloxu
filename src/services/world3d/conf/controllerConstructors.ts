import IController from "../../../components/controls/pub/IController";
import CreatureBody from "../../../components/objects3d/pub/creatures/CreatureBody";
import CreatureBodyController from "../../../components/objects3d/pub/io/CreatureBodyController";

export type TControllerConstructors = {[id: string]: (...args: unknown[]) => IController};

export default (function () {
    return {
        "CreatureBodyController": (creatureBody: CreatureBody) => {
            const controller = new CreatureBodyController(creatureBody);
            controller.extractStateProperties = {
                before: {
                    "point": ["activeStateName", "horizontalAngle"],
                    "changeDirection": ["activeStateName", "absolutePosition"],
                    "triggerPointer": ["absolutePosition", "horizontalAngle",
                        "activeStateName", "selectedItemName"],
                    "pressKey": ["absolutePosition", "horizontalAngle",
                        "activeStateName", "selectedItemName"]
                },
                after: {
                    "point": ["horizontalAngle"],
                    "changeDirection": ["perpetualMotionDirection",
                        "perpetualMotionSpeed"],
                    "triggerPointer": ["absolutePosition", "horizontalAngle",
                        "activeStateName", "selectedItemName"]
                }
            };
            return controller;
        }
    };
})();