import IState from "../../../components/computation/pub/IState";
import EventEmitter from "../../../components/events/pub/EventEmitter";
import IScreen from "../../../components/gui/pub/IScreen";

/**
 * A submenu where the user can 
 * join an existing game.
 */
export default class JoinGameScreen implements IState, IScreen {
    isActive: boolean = false;
    emitter = new EventEmitter();
    codeInput: HTMLInputElement;
    codeInputTitle: HTMLElement;
    errorElement: HTMLElement;
    errorElementTimeout: NodeJS.Timeout;
    wrapper: HTMLElement;

    constructor(
        public overlay: HTMLElement,
        public document: Document
    ) {
        this.wrapper = overlay.children.item(0) as HTMLElement;
        this.overlay.style.display = "none";

        // Create back button.
        const button = document.createElement("button");
        button.innerText = "← Back";
        button.classList.add("styleless-button", "ui-main-menu-button");
        this.wrapper.appendChild(button);
        
        // Make back button transition back to the main menu screen.
        button.addEventListener("click", () => {
            this.end();
            this.emitter.trigger("end", ["home"])
        });

        // Create 'Input Game Code' label.
        this.codeInputTitle = document.createElement("h4");
        this.codeInputTitle.innerText = "Input game code and press enter:";
        this.wrapper.appendChild(this.codeInputTitle);

        // Create input field.
        this.codeInput = document.createElement("input");
        this.codeInput.classList.add("styleless-input", "ui-main-menu-input");
        this.codeInput.placeholder = "Type here";
        this.wrapper.appendChild(this.codeInput);

        // Make input field's input text be always uppercase.
        this.codeInput.addEventListener("input", () => {
            this.codeInput.value = this.codeInput.value.toUpperCase();
        });
        // Add event listener for when the game code has been entered.
        this.codeInput.addEventListener('keydown', async (event) => {
            if (event.key === 'Enter') {
                this.emitter.trigger("joinGame", [this.codeInput.value]);
            }
        });

        // Create element for showing error messages.
        this.errorElement = document.createElement("p");
        this.wrapper.appendChild(this.errorElement);
    }

    showError(error: string): void {
        this.errorElement.innerText = error;

        if (this.errorElementTimeout !== undefined) {
            clearTimeout(this.errorElementTimeout);
            this.errorElementTimeout = undefined;
        }

        this.errorElementTimeout = setTimeout(() => {
            this.errorElement.innerText = "";
        }, 10000);
    }

    start(...args: unknown[]): unknown {
        if (!this.isActive) {
            this.overlay.style.display = "block";
            this.isActive = true;
        }
        return this;
    }

    end(): unknown {
        if (this.isActive) {
            this.overlay.style.display = "none";
            this.codeInput.value = "";
            this.isActive = false;
        }
        return this;
    }

    onEnd(callback: (nextStateId: string, ...args: unknown[]) => void): IState {
        this.emitter.on("end", callback);
        return this;
    }

    /**
     * When the user has decided that
     * they want to join a game.
     */
    onJoinGame(callback: (code: string) => void) {
        this.emitter.on("joinGame", callback);
    }
}