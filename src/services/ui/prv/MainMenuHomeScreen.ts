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
    selectedButton: HTMLButtonElement;
    title: HTMLElement;
    leftSidebar: HTMLElement;
    rightSidebar: HTMLElement;
    wrapper: HTMLElement;

    constructor(
        public overlay: HTMLElement,
        public document: Document
    ) {
        this.wrapper = overlay.children.item(0) as HTMLElement;
    }

    /**
     * Creates the screen's elements.
     */
    render(levels: string[]) {
        // Create the left sidebar.
        this.leftSidebar = document.createElement("div");
        this.leftSidebar.classList.add("ui-main-menu-sidebar", "ui-main-menu-left-sidebar");
        this.wrapper.appendChild(this.leftSidebar);

        // Create title element.
        this.title = document.createElement("h1");
        this.title.innerText = "Bloxu";
        this.title.classList.add("ui-main-menu-home-screen-title");
        this.leftSidebar.appendChild(this.title);
        // Create menu buttons.
        ["playSinglePlayer", "hostGame", "joinGame"].forEach((name) => {
            const button = document.createElement("button");
            button.innerText = this.buttonTitles[name];
            button.classList.add("styleless-button", "ui-main-menu-button");
            this.leftSidebar.appendChild(button);
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

        // Create the right sidebar.
        this.rightSidebar = document.createElement("div");
        this.rightSidebar.classList.add("ui-main-menu-sidebar", "ui-main-menu-right-sidebar");
        this.wrapper.appendChild(this.rightSidebar);
        // Create buttons for all levels to the right sidebar.
        const levelButtons = levels.map((level, index) => {
            const button = document.createElement("button");
            button.innerText = "Level " + (index + 1);
            button.classList.add("styleless-button", "ui-main-menu-button");
            
            button.addEventListener("click", () => {
                this.selectButton(button);
                this.emitter.trigger("selectLevel", [index]);
            });
            
            this.rightSidebar.appendChild(button);

            return button;
        });
        this.selectButton(levelButtons[0]);
    }

    /**
     * Sets the given button as selected.
     */
    selectButton(button: HTMLButtonElement) {
        if (this.selectedButton !== undefined) {
            this.selectedButton.classList.remove("ui-main-menu-selected-button");
        }
        this.selectedButton = button;
        button.classList.add("ui-main-menu-selected-button");
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

    onSelectLevel(callback: (levelIndex: number) => void) {
        this.emitter.on("selectLevel", callback);
    }

    offSelectLevel(callback: (levelIndex: number) => void) {
        this.emitter.off("selectLevel", callback);
    }
}