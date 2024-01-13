import EventEmitter from "../../../components/events/pub/EventEmitter";

/**
 * A notification box.
 */
export default class Notification {
    box: HTMLDivElement;
    returnButton: HTMLButtonElement;
    notificationText: HTMLParagraphElement;
    emitter = new EventEmitter();

    constructor(
        public wrapper: HTMLElement,
        public document: Document,
        public texts: {
            notification: string,
            button: string
        },
        public styleClasses: {
            box: string[],
            button: string[],
            title: string[]
        }
    ) {
        this.box = document.createElement("div");
        this.box.classList.add("ui-main-menu-screen", ...styleClasses.box);
        this.box.style.display = "none";

        this.notificationText = document.createElement("h3");
        this.notificationText.classList.add(...styleClasses.title)
        this.notificationText.innerText = texts.notification;
        this.box.appendChild(this.notificationText);

        this.returnButton = document.createElement("button");
        this.returnButton.classList.add("styleless-button", ...styleClasses.button);
        this.returnButton.innerText = texts.button;
        this.box.appendChild(this.returnButton);

        this.returnButton.addEventListener("click", () => {
            this.emitter.trigger("close");
        });

        wrapper.appendChild(this.box);
    }

    /**
     * Show the screen.
     */
    show() {
        this.box.style.display = "block";
    }

    /**
     * Hide the screen.
     */
    hide() {
        this.box.style.display = "none";
    }
}