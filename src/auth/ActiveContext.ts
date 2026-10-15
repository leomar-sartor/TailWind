import { createContext, useContext } from 'react';
import type { AvailableAccessContext } from '../graphql/Auth/accessQueries';

export type ActiveContextValue = {
  contexts: AvailableAccessContext[];
  activeContext: AvailableAccessContext;
  personas: string[];
  permissions: string[];
  isAdmin: boolean;
  switchContext: (context: AvailableAccessContext) => Promise<void>;
};

export const ActiveContext = createContext<ActiveContextValue | null>(null);

export function useActiveContext() {
  const value = useContext(ActiveContext);
  if (!value) throw new Error('useActiveContext must be used within <ActiveContextGate>');
  return value;
}