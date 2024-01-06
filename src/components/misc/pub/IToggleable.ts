
export default interface IToggleable {
    isEnabled: boolean;
    enable(): IToggleable;
    disable(): IToggleable;
}