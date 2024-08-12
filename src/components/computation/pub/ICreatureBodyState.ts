import ICreatureBodyActions from "../../objects3d/pub/creatures/ICreatureBodyActions";
import IState from "./IState"

type ICreatureBodyState = ICreatureBodyActions & IState;

export default ICreatureBodyState;