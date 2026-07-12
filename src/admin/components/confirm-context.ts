/**
 * Promise-based confirmation dialog — context + hook.
 *
 * Kept in a component-free module so React Fast Refresh stays happy
 * (`react-refresh/only-export-components`). The provider and dialog live in
 * ConfirmProvider.tsx.
 *
 * Usage:
 *   const confirm = useConfirm();
 *   if (!(await confirm({ title: 'Delete?', danger: true }))) return;
 */

import { createContext, useContext, type ReactNode } from 'react';

export interface ConfirmOptions {
  title: string;
  body?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Style the confirm button as a destructive action. */
  danger?: boolean;
}

export type ConfirmFn = (opts: ConfirmOptions) => Promise<boolean>;

export const ConfirmContext = createContext<ConfirmFn | null>(null);

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within <ConfirmProvider>');
  return ctx;
}
