import { DMessage } from "../../../components/messaging/pub/DMessage";
import ProxyMessenger from "../../../components/messaging/pub/ProxyMessenger";
import SyncMessenger from "../../../components/messaging/pub/SyncMessenger";

/**
 * Contains the state and operations of the UI service.
 */
export default class UI {
    proxyMessenger = new ProxyMessenger<DMessage, DMessage>();
    syncMessenger: SyncMessenger;
    codeText: HTMLParagraphElement;
    eventHandlers: {[event: string]: Function}

    constructor(public document: Document) {
        this.syncMessenger = new SyncMessenger(this.proxyMessenger);

        const hostGameButton = document.createElement("button");
        hostGameButton.innerText = "Host Game";
        hostGameButton.addEventListener("click", async () => {
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
        });
        document.body.appendChild(hostGameButton);

        const joinGameTitle = document.createElement("p");
        joinGameTitle.innerText = "Join game:";
        document.body.appendChild(joinGameTitle);

        const joinGameCodeInput = document.createElement("input");
        document.body.appendChild(joinGameCodeInput);
        joinGameCodeInput.addEventListener('keydown', async (event) => {
            if (event.key === 'Enter') {
                const joined = (await this.syncMessenger.postSyncMessage({
                    recipient: "gameMaster",
                    sender: "ui",
                    type: "request",
                    message: {
                        type: "joinGame",
                        args: [joinGameCodeInput.value]
                    }
                }))[0] as boolean;
            }
        });

        const codeTitle = document.createElement("p");
        codeTitle.innerText = "Code: ";
        document.body.appendChild(codeTitle);

        this.codeText = document.createElement("p");
        document.body.appendChild(this.codeText);

        this.eventHandlers = {};
    }
}