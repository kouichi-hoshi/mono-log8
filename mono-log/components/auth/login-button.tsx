"use client";

import { Button } from "@/components/ui/button";
import { useAuthModal } from "@/components/auth/auth-modal-provider";
import { texts } from "@/lib/texts";

export function LoginButton() {
  const { open } = useAuthModal();

  return (
    <Button type="button" onClick={open}>
      {texts.auth.login}
    </Button>
  );
}

