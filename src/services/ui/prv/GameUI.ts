import IState from "../../../components/computation/pub/IState";
import State from "../../../components/computation/pub/State";
import { DStateUpdate } from "../../../components/controls/pub/IController";
import EventEmitter from "../../../components/events/pub/EventEmitter";
import IScreen from "../../../components/gui/pub/IScreen";
import { DCreatureBodyState } from "../../../components/objects3d/pub/io/CreatureBodyState";

interface IHint {
    message: string;
    isEndedByEvent: (eventType: string, args: unknown[]) => boolean;
    canEndBeforeStarting: boolean;
}

/**
 * UI that is shown while the game is active and not in a menu.
 */
export default class GameUI extends State implements IScreen {
    name: string = "gameScreen";
    tutorialHintElement: HTMLElement;
    generalHintElement: HTMLElement;
    emitter: EventEmitter = new EventEmitter();
    isShown: boolean = false;
    tutorialHints: Map<number, IHint[]> = new Map();
    tutorialHintEvents: Set<string> = new Set();
    currentLevelIndex: number;
    undoRedoTaught: boolean = false;
    leavePortalTaught: boolean = false;

    constructor(
        public wrapper: HTMLElement,
        public document: Document
    ) {
        super();
    }

    show() {
        this.isShown = true;
        this.wrapper.style.display = "block";
    }

    hide() {
        this.isShown = false;
        this.wrapper.style.display = "none";
    }

    showError(error: string): void {
        
    }

    render(levels: string[]): void {
        this.tutorialHintElement = document.createElement("div");
        this.tutorialHintElement.classList.add("ui-game-screen-hint");
        this.wrapper.appendChild(this.tutorialHintElement);
        this.tutorialHintElement.style.display = "none";

        this.generalHintElement = document.createElement("div");
        this.generalHintElement.classList.add("ui-game-screen-hint");
        this.wrapper.appendChild(this.generalHintElement);
        this.generalHintElement.style.display = "none";

        this.tutorialHintEvents = new Set([
            "IOService:<event>changeDirection",
            "IOService:<event>triggerPointer",
            "IOService:<event>pressKey"
        ]);

        this.tutorialHints.set(0, [
            {
                message: "Shoot with Left Mouse Button",
                isEndedByEvent: (type: string, args: unknown[]) =>
                    type === "IOService:<event>triggerPointer",
                canEndBeforeStarting: true
            },
            {
                message: "Jump with [Space]",
                isEndedByEvent: (type: string, args: unknown[]) =>
                    (type === "IOService:<event>pressKey" &&
                    args[0] === " "),
                canEndBeforeStarting: true
            },
            {
                message: "Move with [W], [A], [S] and [D]",
                isEndedByEvent: (type: string, args: unknown[]) =>
                    type === "IOService:<event>changeDirection",
                canEndBeforeStarting: true
            }
        ]);
        this.tutorialHints.set(2, [
            {
                message: "Rotate camera with [F]",
                isEndedByEvent: (type: string, args: unknown[]) =>
                    (type === "IOService:<event>pressKey" &&
                    (args[0] as string).toLowerCase() === "f"),
                canEndBeforeStarting: true
            },
        ]);
        this.tutorialHints.set(3, []);
    }

    handleSinglePlayer() {
        this.tutorialHints.get(0).unshift({
            message: "Switch players with [Z]",
            isEndedByEvent: (type: string, args: unknown[]) =>
                (type === "IOService:<event>pressKey" &&
                    (args[0] as string).toLowerCase() === "z"),
                canEndBeforeStarting: true
        });
    }

    handleEvent(type: string, args: unknown[]) {
        if (type === "GameMaster:<event>startLevel") {
            this.generalHintElement.style.display = "none";
            this.currentLevelIndex = args[0] as number;
            this._updateTutorialHintMessage();

        } else if (type === "Creature:<event>controllerTriggerPointer" && !this.undoRedoTaught) {
            const update = args[3] as DStateUpdate<DCreatureBodyState>;
            const newPlacements = update.after["itemState:pickerPlacer"]["placerState"]
                .newPlacements as unknown[];
            if (newPlacements.length > 0 && this.currentLevelIndex === 3) {
                this.tutorialHints.get(3).push(
                    {
                        message: "Redo with [E]",
                        isEndedByEvent: (type: string, args: unknown[]) =>
                            (type === "IOService:<event>pressKey" &&
                            (args[0] as string).toLowerCase() === "e"),
                        canEndBeforeStarting: false
                    }, {
                        message: "Undo with [Q]",
                        isEndedByEvent: (type: string, args: unknown[]) =>
                            (type === "IOService:<event>pressKey" &&
                            args[0] === "q"),
                        canEndBeforeStarting: true
                    }
                );
                this.undoRedoTaught = true;
                this._updateTutorialHintMessage();
            }

        } else if (!this.leavePortalTaught && type === "GameMaster:<event>playerEnterPortal") {
            this.generalHintElement.innerText = "Leave portal with [R]";
            this.generalHintElement.style.display = "block";

        } else if (!this.leavePortalTaught && type === "GameMaster:<event>playerLeavePortal") {
            this.generalHintElement.style.display = "none";
            this.leavePortalTaught = true;

        } else if (this.tutorialHintEvents.has(type)) {
            const hints = this.tutorialHints.get(this.currentLevelIndex);
            if (hints !== undefined) {
                const currentHint = this._currentTutorialHint();
                const nonEndedHints = hints.filter((hint, index) => (
                    !hint.isEndedByEvent(type, args) || (
                        !hint.canEndBeforeStarting && index !== hints.length - 1)));
                this.tutorialHints.set(this.currentLevelIndex, nonEndedHints);

                // If the current hint was ended.
                if (currentHint !== undefined &&
                    nonEndedHints[nonEndedHints.length - 1] !== currentHint) {
                    this._updateTutorialHintMessage();
                }
            }
        }
    }

    /**
     * Updates the tutorial hint message to the next message
     * in the list of tutorial hints for the current level.
     */
    private _updateTutorialHintMessage() {
        const hints = this.tutorialHints.get(this.currentLevelIndex);
        if (hints !== undefined && hints.length !== 0) {
            const hint = hints[hints.length - 1];
            this.tutorialHintElement.innerText = hint.message;
            this.tutorialHintElement.style.display = "block";
        } else {
            this.tutorialHintElement.style.display = "none";
        }
    }

    /**
     * Information of the currently shown tutorial message
     * as an IHint.
     */
    private _currentTutorialHint() {
        if (this.currentLevelIndex !== undefined) {
            const hints = this.tutorialHints.get(this.currentLevelIndex);
            if (hints !== undefined) {
                return hints[hints.length - 1];
            }
        } else {
            return undefined;
        }
    }
}