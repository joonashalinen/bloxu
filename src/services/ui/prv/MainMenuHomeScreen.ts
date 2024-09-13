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
        "joinGame": "Join Game",
        "playSinglePlayer": "Play Single"
    };
    title: HTMLElement;
    wrapper: HTMLElement;

    constructor(
        public overlay: HTMLElement,
        public document: Document
    ) {
        this.wrapper = overlay.children.item(0) as HTMLElement;
        // Create title element.
        this.title = document.createElement("h1");
        this.title.innerText = "Bloxu";
        this.title.classList.add("ui-main-menu-home-screen-title");
        this.wrapper.appendChild(this.title);
        // Create menu buttons.
        ["playSinglePlayer", "hostGame", "joinGame"].forEach((name) => {
            const button = document.createElement("button");
            button.innerText = this.buttonTitles[name];
            button.classList.add("styleless-button", "ui-main-menu-button");
            this.wrapper.appendChild(button);
            this.buttons[name] = button;
        });
        // Add event listeners to menu buttons.
        this.buttons["hostGame"].addEventListener("click", () => {
            this.end();
            this.emitter.trigger("end", ["hostGame"]);
            this.emitter.trigger("hostGame");
        });
        this.buttons["joinGame"].addEventListener("click", () => {
            this.end();
            this.emitter.trigger("end", ["joinGame"]);
        });
        this.buttons["playSinglePlayer"].addEventListener("click", () => {
            this.emitter.trigger("playSinglePlayer");
        });
    }

    showError(error: string): void {
        
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