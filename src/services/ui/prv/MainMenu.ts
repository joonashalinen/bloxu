import IState from "../../../components/computation/pub/IState";
import StateMachine from "../../../components/computation/pub/StateMachine";
import EventEmitter from "../../../components/events/pub/EventEmitter";
import IEventable from "../../../components/events/pub/IEventable";
import IScreen from "../../../components/gui/pub/IScreen";
import HostGameScreen from "./HostGameScreen";
import JoinGameScreen from "./JoinGameScreen";
import MainMenuHomeScreen from "./MainMenuHomeScreen";

/**
 * The main menu of the Bloxu game's ui.
 */
export default class MainMenu implements IEventable {
    subMenuStateMachine: StateMachine<IState & IScreen>;
    emitter = new EventEmitter();

    constructor(
        public wrapper: HTMLElement,
        public document: Document
    ) {
        this.subMenuStateMachine = new StateMachine(
            {
                "home": new MainMenuHomeScreen(
                    this._makeWrapper("ui-main-menu-home-screen", ["ui-main-menu-screen"], ["overlay"]),
                    document
                ),
                "joinGame": new JoinGameScreen(
                    this._makeWrapper("ui-main-menu-join-game-screen", ["ui-main-menu-screen"], ["overlay", "ui-opaque-overlay"]),
                    document
                ),
                "hostGame": new HostGameScreen(
                    this._makeWrapper("ui-main-menu-host-game-screen", ["ui-main-menu-screen"], ["overlay", "ui-opaque-overlay"]),
                    document
                )
            }
        );

        (this.subMenuStateMachine.states["home"] as MainMenuHomeScreen).onHostGame(() => {
            this.emitter.trigger("hostGame");
        });

        (this.subMenuStateMachine.states["home"] as MainMenuHomeScreen).emitter.on("playSinglePlayer", () => {
            this.emitter.trigger("playSinglePlayer");
        });

        (this.subMenuStateMachine.states["joinGame"] as JoinGameScreen).onJoinGame((code: string) => {
            this.emitter.trigger("joinGame", [code]);
        });

        this.subMenuStateMachine.activateState("home");
    }

    /**
     * Make new wrapper that is a child of the current wrapper.
     */
    private _makeWrapper(id: string, wrapperClasses: string[] = [], overlayClasses: string[] = []) {
        const wrapper = this.document.createElement("div");
        wrapper.id = id;
        wrapper.classList.add(...wrapperClasses);

        const overlay = document.createElement("div");
        overlay.classList.add(...overlayClasses);
        overlay.appendChild(wrapper);
        this.wrapper.appendChild(overlay);
        return overlay;
    }

    /**
     * When the user has decided that
     * they want to host a game.
     */
    onHostGame(callback: () => void) {
        this.emitter.on("hostGame", callback);
    }

    /**
     * When the user has decided that
     * they want to join a game.
     */
    onJoinGame(callback: (code: string) => void) {
        this.emitter.on("joinGame", callback);
    }

    /**
     * Show the main menu.
     */
    show() {
        this.wrapper.style.display = "block";
    }

    /**
     * Hide the main menu.
     */
    hide() {
        this.wrapper.style.display = "none";
    }

    /**
     * Shows an error in the main menu's currently active screen.
     */
    showError(msg: string) {
        const currentState = this.subMenuStateMachine.firstActiveState();
        if (currentState !== undefined) {
            currentState.showError(msg);
        }
    }
}