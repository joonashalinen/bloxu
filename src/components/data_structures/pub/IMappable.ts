
export default interface IMappable {
    wrappee: unknown
    /**
     * Map through the IMappable's values.
     */
    map(transformer: (value: unknown) => unknown): IMappable;
}