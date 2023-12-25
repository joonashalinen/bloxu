
export default interface DMediatorMessage<T> {
    recipient: string;
    message: T;
}