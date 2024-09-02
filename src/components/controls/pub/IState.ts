
export type TProperty = string | {name: string; subProperties: TProperty[];};

export default interface IState<T> {
    extract(properties: TProperty[]): T;
    inject(data: T): void;
}