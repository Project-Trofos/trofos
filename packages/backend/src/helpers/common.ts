export function numberOrUndefined(maybeNumber: string | undefined): number | undefined {
  if (maybeNumber === undefined) {
    return undefined;
  }
  return Number(maybeNumber);
}

// Exclude keys from user
export function exclude<T, Key extends keyof T>(model: T, keys: Key[]): Omit<T, Key> {
  const excludedModel = model;

  keys.forEach((key) => delete excludedModel[key]);

  return excludedModel;
}
