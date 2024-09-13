import IState from "../../../components/computation/pub/IState";
import EventEmitter from "../../../components/events/pub/EventEmitter";
import IScreen from "../../../components/gui/pub/IScreen";

/**
 * A main menu screen where the user is waiting for another player to join the game 
 * they are hosting.
 */
export default class HostGameScreen implements IState, IScreen {
    isActive: boolean = false;
    emitter = new EventEmitter()
    messageElement: HTMLElement;
    codeElement: HTMLElement;
    errorElement: HTMLElement;
    errorElementTimeout: NodeJS.Timeout;
    wrapper: HTMLElement;

    constructor(
        public overlay: HTMLElement,
        public document: Document
    ) {
        this.wrapper = overlay.children.item(0) as HTMLElement;
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

    /**
     * Creates the screen's elements.
     */
    render() {
        this.codeElement = document.createElement("p");
        this.wrapper.appendChild(this.codeElement);

        this.messageElement = document.createElement("p");
        this.messageElement.innerText = "Waiting for the other player to join..";
        this.wrapper.appendChild(this.messageElement);

        // Create element for showing error messages.
        this.errorElement = document.createElement("p");
        this.wrapper.appendChild(this.errorElement);
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
            this.codeElement.innerText = "";
            this.isActive = false;
        }
        return this;
    }

    onEnd(callback: (nextStateId: string, ...args: unknown[]) => void): IState {
        this.emitter.on("end", callback);
        return this;
    }

    /**
     * Set the game code.
     */
    setCode(code: string) {
        this.codeElement.innerText = "Game code: " + code;
    }
}