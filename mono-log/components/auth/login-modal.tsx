"use client";

import * as React from "react";
import { XIcon } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/auth/authClient";
import { texts } from "@/lib/texts";

type LoginModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSignIn = async () => {
    setIsSubmitting(true);
    try {
      await authClient.signIn();
      onOpenChange(false);
      router.refresh();
    } catch {
      onOpenChange(false);
      toast.error(texts.toast.error.authError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogClose asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-3 top-3"
            aria-label="閉じる"
          >
            <XIcon className="size-4" />
          </Button>
        </DialogClose>
        <DialogHeader>
          <DialogTitle>{texts.auth.login}</DialogTitle>
          <DialogDescription>
            {texts.auth.loginDescription}
          </DialogDescription>
        </DialogHeader>
        <div className="pt-2">
          <Button type="button" onClick={handleSignIn} disabled={isSubmitting}>
            {texts.auth.loginWithGoogle}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

