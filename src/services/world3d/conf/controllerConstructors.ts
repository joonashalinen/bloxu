import CreatureBody from "../../../components/objects3d/pub/creatures/CreatureBody";
import CreatureBodyController from "../../../components/objects3d/pub/io/CreatureBodyController";

export default (function () {
    return {
        "CreatureBodyController": (creatureBody: CreatureBody) =>
            new CreatureBodyController(creatureBody)
    };
})();