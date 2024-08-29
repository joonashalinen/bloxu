import CreatureBody from "../../../components/objects3d/pub/creatures/CreatureBody";
import CreatureBodyController from "../../../components/objects3d/pub/io/CreatureBodyController";

export default (function () {
    return {
        "CreatureBodyController": (creatureBody: CreatureBody) => {
            const controller = new CreatureBodyController(creatureBody);
            controller.extractStateProperties = {
                before: {
                    "point": ["horizontalAngle"],
                    "move": ["perpetualMotionDirection", "absolutePosition"],
                    "triggerPointer": ["absolutePosition", "horizontalAngle",
                        "activeStateName", "selectedItemName"],
                    "pressFeatureKey": ["absolutePosition", "horizontalAngle",
                        "activeStateName", "selectedItemName"]
                },
                after: {}
            };
            return controller;
        }
    };
})();