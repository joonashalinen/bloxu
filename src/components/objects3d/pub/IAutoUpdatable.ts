import IEventable, { isEventable } from "../../events/pub/IEventable";

export function isAutoUpdatable(obj: Object): obj is IAutoUpdatable {
    return (
        isEventable(obj) &&
        ("enableAutoUpdate" in obj && typeof obj.enableAutoUpdate === "function") 
    );
}

export default interface IAutoUpdatable extends IEventable {
    autoUpdateEnabled: boolean;
    enableAutoUpdate(): IAutoUpdatable;
    disableAutoUpdate(): IAutoUpdatable;
}