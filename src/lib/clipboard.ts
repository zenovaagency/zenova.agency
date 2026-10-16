/**
 * Copy text to the clipboard, resolving to whether it worked.
 *
 * `navigator.clipboard` needs a secure context and a permission the browser is
 * free to refuse (Safari does so outside a user gesture; some in-app browsers
 * never expose it), so the legacy `execCommand` path is kept as a fallback.
 * Callers show their own confirmation and should treat `false` as "tell the
 * reader to copy it by hand" rather than as an error.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fall through to the legacy path.
  }

  try {
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand('copy');
    el.remove();
    return ok;
  } catch {
    return false;
  }
}
