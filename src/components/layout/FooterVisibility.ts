import { createContext, useContext, useEffect } from 'react';

/**
 * Lets the catch-all route decide whether the layout renders a footer.
 *
 * Known paths get one synchronously from the path itself. The catch-all can't
 * be judged that way — the same URL is either an admin-authored SEO page
 * (footer) or a 404 (no footer), and which one it is isn't known until the
 * fetch resolves. Reporting it up to the layout keeps the footer inside the
 * page-transition wrapper so it fades in with the content, instead of the page
 * rendering a second <Footer/> of its own that pops in afterwards.
 */
export const FooterVisibilityContext = createContext<((visible: boolean) => void) | null>(null);

/** Show the layout footer for this route while `visible` holds. */
export function useShowFooter(visible: boolean): void {
  const setVisible = useContext(FooterVisibilityContext);
  useEffect(() => {
    if (!setVisible || !visible) return;
    setVisible(true);
    return () => setVisible(false);
  }, [setVisible, visible]);
}
