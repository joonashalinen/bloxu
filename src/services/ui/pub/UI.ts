import { DMessage } from "../../../components/messaging/pub/DMessage";
import ProxyMessenger from "../../../components/messaging/pub/ProxyMessenger";
import SyncMessenger from "../../../components/messaging/pub/SyncMessenger";
import Notification from "../prv/Notification";
import MainMenu from "../prv/MainMenu";
import HostGameScreen from "../prv/HostGameScreen";
import Channel from "../../../components/messaging/pub/Channel";

/**
 * Contains the state and operations of the UI service.
 */
export default class UI {
    proxyMessenger = new ProxyMessenger<DMessage, DMessage>();
    syncMessenger: SyncMessenger;
    eventHandlers: {[event: string]: Function}
    mainMenu: MainMenu;
    endGameScreenWrapper: HTMLElement;
    gameChannel: Channel = new Channel("ui", "gameMaster", this.proxyMessenger);

    constructor(
        public document: Document,
        public wrapper?: HTMLElement
    ) {
        this.eventHandlers = {
            "GameMaster:<event>loseGame": this.onGameLose.bind(this),
            "GameMaster:<event>winGame": this.onGameWin.bind(this),
            "GameMaster:<event>completeGame": this.onGameComplete.bind(this),
            "GameMaster:<event>startGame": this.onGameStart.bind(this)
        };

        this.syncMessenger = new SyncMessenger(this.proxyMessenger);

        if (wrapper === undefined) {
            this.wrapper = this.createOverlayWrapper("ui-main-menu-wrapper");
        }

        this.mainMenu = new MainMenu(this.wrapper!, document);

        this.mainMenu.onHostGame(async () => {
            const response = await this.syncMessenger.postSyncMessage({
                recipient: "gameMaster",
                sender: "ui",
                type: "request",
                message: {
                    type: "hostGame",
                    args: []
                }
            }) as string | {error: string};
            // If no error occurred.
            if (typeof response === "string") {
                const currentState = this.mainMenu.subMenuStateMachine.firstActiveState();
                // If we are still in the host game screen.
                if (currentState === this.mainMenu.subMenuStateMachine.states["hostGame"]) {
                    (currentState as HostGameScreen).setCode(response);
                }
            }
        });

        this.mainMenu.onSelectLevel((levelIndex: number) => {
            this.gameChannel.request("selectLevel", [levelIndex, true]);
        });

        this.mainMenu.emitter.on("playSinglePlayer", async () => {
            await this.syncMessenger.postSyncMessage({
                recipient: "gameMaster",
                sender: "ui",
                type: "request",
                message: {
                    type: "startLocalGame",
                    args: []
                }
            }) as string | {error: string};

            this.mainMenu.hide();
        });

        this.mainMenu.onJoinGame(async (code: string) => {
            const response = await this.syncMessenger.postSyncMessage({
                recipient: "gameMaster",
                sender: "ui",
                type: "request",
                message: {
                    type: "joinGame",
                    args: [code]
                }
            }) as string | {error: string};

            if (typeof response === "string") {
                this.mainMenu.hide();
            } else {
                this.mainMenu.showError(response.error);
            }
        });

        this.mainMenu.hide();
    }

    /**
     * Creates the UI's elements and makes it interactive.
     * Note: does not show the UI.
     */
    async render() {
        this.endGameScreenWrapper = this.createOverlayWrapper("ui-end-game-screen-wrapper");
        this.endGameScreenWrapper.style.display = "none";

        const levels = await this.gameChannel.request("levels") as string[];
        this.mainMenu.render(levels);
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
     * When the player has completed the game.
     */
    onGameComplete() {
        this.showEndScreen("You completed the game!");
    }

    /**
     * When the game has started. Relevant only when hosting a game (and thus waiting 
     * for the other player to join before hiding the main menu)
     * since when joining a game the game starts immediately.
     */
    onGameStart() {
        this.mainMenu.hide();
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

    /**
     * Show the UI.
     */
    async show() {
        await this.gameChannel.request("previewLevel", [0]);
        this.mainMenu.show();
        // Hide the initial loading screen.
        await new Promise((resolve) => {
            const loadingScreen = document.getElementById("first-loading-screen-overlay");
            loadingScreen.style.opacity = "0%";
            setTimeout(() => {
                loadingScreen.style.display = "none";
                resolve(null);
            }, 1000);
        });
    }

    /**
     * Hide the UI:
     */
    hide() {
        this.mainMenu.hide();
    }
}