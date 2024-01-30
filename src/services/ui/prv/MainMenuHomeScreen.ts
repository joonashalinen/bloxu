import IState from "../../../components/computation/pub/IState";
import EventEmitter from "../../../components/events/pub/EventEmitter";
import IEventable from "../../../components/events/pub/IEventable";
import IScreen from "../../../components/gui/pub/IScreen";

/**
 * The top-level menu screen in the main menu.
 */
export default class MainMenuHomeScreen implements IState, IEventable, IScreen {
    isActive: boolean = false;
    emitter = new EventEmitter();
    buttons: {[name: string]: HTMLElement} = {};
    buttonTitles: {[name: string]: string} = {
        "hostGame": "Host Game",
        "joinGame": "Join Game"
    };
    title: HTMLElement;

    constructor(
        public wrapper: HTMLElement,
        public document: Document
    ) {
        // Create title element.
        this.title = document.createElement("h1");
        this.title.innerText = "Sky Duel";
        this.title.classList.add("ui-main-menu-home-screen-title");
        this.wrapper.appendChild(this.title);
        // Create menu buttons.
        ["hostGame", "joinGame"].forEach((name) => {
            const button = document.createElement("button");
            button.innerText = this.buttonTitles[name];
            button.classList.add("styleless-button", "ui-main-menu-button");
            wrapper.appendChild(button);
            this.buttons[name] = button;
        });
        // Add event listeners to menu buttons.
        this.buttons["hostGame"].addEventListener("click", () => this.emitter.trigger("hostGame"));
        this.buttons["joinGame"].addEventListener("click", () => {
            this.end();
            this.emitter.trigger("end", ["joinGame"]);
        });
    }

    showError(error: string): void {
        
    }

    start(...args: unknown[]): unknown {
        if (!this.isActive) {
            this.wrapper.style.display = "block";
            this.isActive = true;
        }
        return this;
    }

    end(): unknown {
        if (this.isActive) {
            this.wrapper.style.display = "none";
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
     * they want to host a game.
     */
    onHostGame(callback: () => void) {
        this.emitter.on("hostGame", callback);
    }
}