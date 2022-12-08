export default function numberOrUndefined(maybeNumber: string | undefined): number | undefined {
  if (maybeNumber === undefined) {
    return undefined;
  }
  return Number(maybeNumber);
}
