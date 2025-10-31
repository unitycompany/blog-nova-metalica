'use client';

import { createContext, useContext } from 'react';

export type ContactModalData = {
  name?: string;
  email?: string;
  phone?: string;
};

export type ContactModalContextValue = {
  open: (data?: ContactModalData) => void;
  close: () => void;
};

const ContactModalContext = createContext<ContactModalContextValue | undefined>(undefined);

export function useContactModal() {
  const context = useContext(ContactModalContext);

  if (!context) {
    throw new Error('useContactModal must be used within a ContactModalContext.Provider');
  }

  return context;
}

export default ContactModalContext;
