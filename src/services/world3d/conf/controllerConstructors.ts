import IController from "../../../components/controls/pub/IController";
import CreatureBody from "../../../components/objects3d/pub/creatures/CreatureBody";
import CreatureBodyController from "../../../components/objects3d/pub/io/CreatureBodyController";
import ObjectManager from "../../../components/objects3d/pub/ObjectManager";

export type TControllerConstructors = {[id: string]: (...args: unknown[]) => IController};

export default function createControllerConstructors(objectManager: ObjectManager) {
    return {
        "CreatureBodyController": (creatureBody: CreatureBody) => {
            const controller = new CreatureBodyController(creatureBody, objectManager);
            controller.extractStateProperties = {
                before: {
                    "point": ["activeStateName", "horizontalAngle"],
                    "changeDirection": ["activeStateName", "absolutePosition"],
                    "triggerPointer": ["absolutePosition", "horizontalAngle",
                        "activeStateName"],
                    "pressKey": ["absolutePosition", "horizontalAngle",
                        "activeStateName"]
                },
                after: {
                    "point": ["horizontalAngle"],
                    "changeDirection": ["perpetualMotionDirection",
                        "perpetualMotionSpeed"],
                    "triggerPointer": [{
                            name: "itemState:pickerPlacer",
                            subProperties: [{
                                name: "placerState",
                                subProperties: ["newPlacements"]
                            }]
                        }
                    ],
                    "pressKey": ["newUndoRedos"]
                }
            };
            return controller;
        }
    };
};