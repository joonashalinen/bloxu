
export interface DMessageData {
    type: string,
    args: [unknown]
}

export interface DMessage {
    sender: string;
    recipient: string;
    type: "request" | "event" | "response";
    id?: string;
    message: DMessageData;
};