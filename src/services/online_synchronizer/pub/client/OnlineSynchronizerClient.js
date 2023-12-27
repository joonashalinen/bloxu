import EventEmitter from "../../../../components/events/pub/EventEmitter";
/**
 * Contains the operations and state of the
 * OnlineSynchronizerClient service.
 */
export default class OnlineSynchronizerClient {
    constructor() {
        // vvv Setup WebSocket connection to OnlineSynchronizerServer. vvv
        // Create WebSocket connection.
        var socket = new WebSocket("ws://localhost:3000");
        socket.addEventListener("error", (event) => {
            console.log("Error occurred when trying to open websocket.");
            console.log(event);
        });
        // Connection opened
        socket.addEventListener("open", (event) => {
            console.log("sending via websocket");
            setTimeout(() => {
                socket.send(JSON.stringify({
                    recipient: "onlineSynchronizerServer",
                    message: {
                        type: "request",
                        message: {
                            type: "joinGame",
                            args: ["ABC", "1"]
                        }
                    }
                }));
            }, 1000);
        });
        // Listen for messages
        socket.addEventListener("message", (event) => {
            console.log("Message from server ", event.data);
        });
        // vvv Set properties. vvv
        this.emitter = new EventEmitter();
        this.socketToServer = socket;
    }
}
//# sourceMappingURL=OnlineSynchronizerClient.js.map