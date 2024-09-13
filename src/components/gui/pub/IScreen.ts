
/**
 * A screen of a graphical user interface.
 */
export default interface IScreen {
    showError(error: string): void;
    render(...args: unknown[]): void;
}