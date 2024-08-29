import { DStateUpdate } from "./IController";

export interface DRemoteStateUpdate<T> {
    expect: DStateUpdate<T>;
    set: DStateUpdate<T>;
}

export interface DStateConflict<T> {
    expected: T;
    encountered: T;
}

export interface DRemoteUpdateResult<T> {
    conflictsOccurred: boolean;
    conflicts: DStateUpdate<DStateConflict<T>>;
}