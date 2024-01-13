import { DMessage } from "../../../components/messaging/pub/DMessage";
import ProxyMessenger from "../../../components/messaging/pub/ProxyMessenger";
import SyncMessenger from "../../../components/messaging/pub/SyncMessenger";
import Notification from "../prv/Notification";
import MainMenu from "../prv/MainMenu";

/**
 * Contains the state and operations of the UI service.
 */
export default class UI {
    proxyMessenger = new ProxyMessenger<DMessage, DMessage>();
    syncMessenger: SyncMessenger;
    codeText: HTMLSpanElement;
    eventHandlers: {[event: string]: Function}
    mainMenu: MainMenu;
    codeWrapper: HTMLElement;
    endGameScreenWrapper: HTMLElement;

    constructor(
        public document: Document,
        public wrapper?: HTMLElement
    ) {
        this.syncMessenger = new SyncMessenger(this.proxyMessenger);

        if (wrapper === undefined) {
            this.wrapper = this.createOverlayWrapper("ui-main-menu-wrapper");
        }

        this.mainMenu = new MainMenu(this.wrapper!, document);

        this.mainMenu.onHostGame(async () => {
            const code = (await this.syncMessenger.postSyncMessage({
                recipient: "gameMaster",
                sender: "ui",
                type: "request",
                message: {
                    type: "hostGame",
                    args: []
                }
            }))[0] as string;
            this.codeText.innerText = this.codeText.innerText + code;
            this.codeWrapper.style.display = "block";
        });

        this.mainMenu.onJoinGame(async (code: string) => {
            (await this.syncMessenger.postSyncMessage({
                recipient: "gameMaster",
                sender: "ui",
                type: "request",
                message: {
                    type: "joinGame",
                    args: [code]
                }
            }))[0] as boolean;
        });

        this.codeWrapper = document.createElement("div");
        this.codeWrapper.classList.add("ui-code-wrapper");
        document.body.appendChild(this.codeWrapper);
        this.codeWrapper.style.display = "none";

        const codeTitle = document.createElement("span");
        codeTitle.innerText = "Game Code: ";
        this.codeWrapper.appendChild(codeTitle);

        this.codeText = document.createElement("span");
        this.codeWrapper.appendChild(this.codeText);

        this.eventHandlers = {
            "GameMaster:<event>loseGame": this.onGameLose.bind(this),
            "GameMaster:<event>winGame": this.onGameWin.bind(this)
        };

        this.endGameScreenWrapper = this.createOverlayWrapper("ui-end-game-screen-wrapper");
        this.endGameScreenWrapper.style.display = "none";
    }

    /**
     * When the player has lost the game.
     */
    onGameLose() {
        this.showEndScreen("You lost");
    }

    /**
     * When the player has won the game.
     */
    onGameWin() {
        this.showEndScreen("You won!");
    }

    /**
     * Show either a win or lose message.
     */
    showEndScreen(text: string) {
        this.endGameScreenWrapper.style.display = "block";
        const endScreen = new Notification(
            this.endGameScreenWrapper, 
            this.document,
            {
                notification: text,
                button: "Go to Main Menu"
            },
            {
                button: ["ui-main-menu-button"],
                title: [],
                box: ["ui-main-menu-screen", "ui-end-game-screen-box"]
            }
        );

        endScreen.show();
        endScreen.emitter.on("close", () => location.reload());
    }

    /**
     * Create a new wrapper element that overlays 
     * the whole body.
     */
    createOverlayWrapper(id: string) {
        const wrapper = this.document.createElement("div");
        wrapper.classList.add("overlay");
        wrapper.id = id;
        this.document.body.appendChild(wrapper);
        return wrapper;
    }
}