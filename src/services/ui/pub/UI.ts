import { DMessage } from "../../../components/messaging/pub/DMessage";
import ProxyMessenger from "../../../components/messaging/pub/ProxyMessenger";
import SyncMessenger from "../../../components/messaging/pub/SyncMessenger";
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

    constructor(
        public document: Document,
        public wrapper?: HTMLElement
    ) {
        this.syncMessenger = new SyncMessenger(this.proxyMessenger);

        if (wrapper === undefined) {
            this.wrapper = document.createElement("div");
            this.wrapper.classList.add("overlay");
            this.wrapper.id = "ui-main-menu-wrapper";
            document.body.appendChild(this.wrapper);
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
    }

    /**
     * When the player has lost the game.
     */
    onGameLose() {
        window.alert("You lost")
        location.reload();
    }

    /**
     * When the player has won the game.
     */
    onGameWin() {
        window.alert("You won")
        location.reload();
    }
}