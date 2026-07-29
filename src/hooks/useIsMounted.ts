'use client';
import { useSyncExternalStore } from 'react';

/**
 * False on the server and through the hydration pass, true afterwards.
 *
 * For content that genuinely cannot exist in the server HTML — a portal into
 * `document.body`, anything measuring the viewport. Gate on this rather than on
 * `typeof document !== 'undefined'`: the latter is already true during the
 * client's *first* render, which would make that render disagree with the
 * markup the server sent and cost the whole subtree its hydration.
 *
 * Implemented with useSyncExternalStore rather than the usual
 * `useState(false)` + `useEffect(() => setMounted(true))` because that is
 * precisely what getServerSnapshot exists to express — and it avoids a
 * setState-in-effect, which schedules a second render pass on every mount.
 *
 * `subscribe` returns a no-op unsubscribe: the value transitions once, driven
 * by hydration itself, and never changes again.
 */
const subscribe = () => () => {};

export function useIsMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
