
export interface DMessageData {
    type: string,
    args: [unknown]
}

export interface DMessage {
    type: "request" | "event";
    message: DMessageData
};