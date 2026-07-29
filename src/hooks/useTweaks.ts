'use client';
import { useCallback, useState } from 'react';
import type { Tweaks, TweaksSetter } from '@/types/tweaks';

/**
 * Single source of truth for tweak values. setTweak persists via the host
 * (__edit_mode_set_keys → host rewrites the EDITMODE block on disk).
 *
 * Accepts either setTweak('key', value) or setTweak({ key: value, ... }) so a
 * useState-style call doesn't write a "[object Object]" key into the persisted
 * JSON block.
 */
export function useTweaks(defaults: Tweaks): [Tweaks, TweaksSetter] {
  const [values, setValues] = useState<Tweaks>(defaults);

  const setTweak = useCallback(
    (keyOrEdits: keyof Tweaks | Partial<Tweaks>, val?: unknown): void => {
      const edits =
        typeof keyOrEdits === 'object' && keyOrEdits !== null
          ? (keyOrEdits as Partial<Tweaks>)
          : ({ [keyOrEdits as keyof Tweaks]: val } as Partial<Tweaks>);

      setValues((prev) => ({ ...prev, ...edits }));

      if (typeof window !== 'undefined') {
        window.parent.postMessage({ type: '__edit_mode_set_keys', edits }, '*');
        window.dispatchEvent(new CustomEvent('tweakchange', { detail: edits }));
      }
    },
    [],
  );

  return [values, setTweak as TweaksSetter];
}
