
/**
 * A state of a creature that cares about 
 * general keys that can be pressed to make 
 * the creature perform actions.
 */
export default interface IKeyableState {
    pressFeatureKey(key: string): IKeyableState;
    releaseFeatureKey(key: string): IKeyableState;
}