"use client";

import * as React from "react";

import { LoginModal } from "@/components/auth/login-modal";

type AuthModalContextValue = {
  open: () => void;
  close: () => void;
};

const AuthModalContext = React.createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const value = {
    open: () => setOpen(true),
    close: () => setOpen(false),
  };

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      <LoginModal open={open} onOpenChange={setOpen} />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = React.useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModal must be used within AuthModalProvider");
  }
  return context;
}
