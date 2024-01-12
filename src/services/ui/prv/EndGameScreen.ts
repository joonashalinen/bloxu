
/**
 * A UI screen that is displayed when the player wins or loses.
 */
export default class EndGameScreen {
    box: HTMLDivElement;
    returnButton: HTMLButtonElement;
    notificationText: HTMLParagraphElement;

    constructor(
        public wrapper: HTMLElement,
        public document: Document
    ) {
        this.box = document.createElement("div");
        this.box.classList.add("ui-end-game-screen-box");
        this.box.style.display = "none";

        this.notificationText = document.createElement("p");
        this.notificationText.classList.add("")

        this.returnButton = document.createElement("button");
        this.returnButton.classList.add("styleless-button", "ui-main-menu-button");


    }

    /**
     * Show the screen.
     */
    start() {
        
    }

    /**
     * Hide the screen.
     */
    end() {
        
    }
}