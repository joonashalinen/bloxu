export default interface FunctionWrapper<F extends Function> {
    boundArgs: Array<unknown>;
    f: F;
};