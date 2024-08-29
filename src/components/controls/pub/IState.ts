
export default interface IState<T> {
    extract(properties: string[]): T;
    inject(data: T): void;
}