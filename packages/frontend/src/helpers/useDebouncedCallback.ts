import { useEffect, useMemo, useRef } from 'react';
import { debounce } from 'lodash';

/**
 * Returns a debounced version of callback that stays stable across renders
 * (always calling the latest callback) and is flushed/cancelled on unmount.
 */
export default function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delayMs: number,
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const debounced = useMemo(
    () => debounce((...args: Args) => callbackRef.current(...args), delayMs),
    [delayMs],
  );

  useEffect(() => () => debounced.cancel(), [debounced]);

  return debounced;
}
