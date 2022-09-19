export type PickRename<T, K extends keyof T, R extends PropertyKey> = Pick<Omit<T, K> & { [P in R]: T[K] }, R>;
