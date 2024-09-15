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
    unlockedLevelsLocalStorageKey = "UI:MainMenu:MainMenuHomeScreen?unlockedLevels";
    levelButtons: HTMLButtonElement[];

    constructor(
        public overlay: HTMLElement,
        public document: Document,
        public window: Window
    ) {
        this.wrapper = overlay.children.item(0) as HTMLElement;
    }

    /**
     * Creates the screen's elements.
     */
    render(levels: string[]) {
        // Initialize list of unlocked levels to localStorage if it has not been initialized yet.
        if (this.window.localStorage.getItem(this.unlockedLevelsLocalStorageKey) === null) {
            this.window.localStorage.setItem(this.unlockedLevelsLocalStorageKey, "[0]");
        }

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
            if (!this.isActive) return;
            this.end();
            this.emitter.trigger("end", ["hostGame"]);
            this.emitter.trigger("hostGame");
        });
        this.buttons["joinGame"].addEventListener("click", () => {
            if (!this.isActive) return;
            this.end();
            this.emitter.trigger("end", ["joinGame"]);
        });
        this.buttons["playSinglePlayer"].addEventListener("click", () => {
            if (!this.isActive) return;
            this.end();
            this.emitter.trigger("playSinglePlayer");
        });

        // Create the right sidebar.
        this.rightSidebar = document.createElement("div");
        this.rightSidebar.classList.add("ui-main-menu-sidebar", "ui-main-menu-right-sidebar");
        this.wrapper.appendChild(this.rightSidebar);

        // Create buttons for all levels to the right sidebar.
        const unlockedLevels = new Set<number>(this.unlockedLevels());
        this.levelButtons = levels.map((level, index) => {
            const button = document.createElement("button");
            button.innerText = "Level " + (index + 1);
            button.classList.add("styleless-button", "ui-main-menu-button");
            if (!unlockedLevels.has(index)) {
                button.classList.add("ui-main-menu-button-disabled");
                const lockElement = document.createElement("img");
                lockElement.src = "assets/images/lock.png";
                lockElement.classList.add("ui-main-menu-button-icon");
                button.appendChild(lockElement);
            };

            button.addEventListener("click", () => {
                if (!this.isActive) return;
                const unlockedLevels = new Set<number>(this.unlockedLevels());
                if (unlockedLevels.has(index)) this.emitter.trigger("selectLevel", [index]);
            });
            
            this.rightSidebar.appendChild(button);

            return button;
        });
        this.selectButton(this.levelButtons[0]);
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

    selectLevel(levelIndex: number) {
        this.selectButton(this.levelButtons[levelIndex]);
    }

    /**
     * List of indices of levels that have been unlocked.
     * Retrieved from localStorage.
     */
    unlockedLevels() {
        return JSON.parse(this.window.localStorage.getItem(this.unlockedLevelsLocalStorageKey));
    }

    /**
     * Unlocks the level with the given index, which changes the styling of 
     * the associated level selection button and saves the unlocked level to localStorage.
     */
    unlockLevel(levelIndex: number) {
        const unlockedLevels = new Set<number>(this.unlockedLevels());
        if (!unlockedLevels.has(levelIndex)) {
            unlockedLevels.add(levelIndex);
            this.window.localStorage.setItem(this.unlockedLevelsLocalStorageKey,
                JSON.stringify(Array.from(unlockedLevels)));
            
            const button = this.levelButtons[levelIndex];
            button.classList.remove("ui-main-menu-button-disabled");
            button.removeChild(button.children[0]);
        }
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

    handleEvent(type: string, args: unknown[]) {
        if (type === "GameMaster:<event>startLevel") {
            this.unlockLevel(args[0] as number);
        }
    }
}