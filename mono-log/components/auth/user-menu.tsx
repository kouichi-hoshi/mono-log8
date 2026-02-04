"use client";

import * as React from "react";
import { UserIcon } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { AuthUser } from "@/server/auth/types";
import { authClient } from "@/lib/auth/authClient";
import { queryClient } from "@/lib/queryClient";
import { texts } from "@/lib/texts";

type UserMenuProps = {
  user: AuthUser;
};

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const displayName = user.name ?? user.email ?? "User";

  const handleSignOut = async () => {
    setOpen(false);
    setIsSubmitting(true);
    try {
      await authClient.signOut();
      router.replace("/");
      router.refresh();
      queryClient.removeQueries({ queryKey: ["posts"] });
      queryClient.removeQueries({ queryKey: ["posts-filter"] });
    } catch {
      toast.error(texts.toast.error.authError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="ユーザーメニュー"
        >
          <UserIcon className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56">
        <PopoverHeader>
          <PopoverTitle>{displayName}</PopoverTitle>
        </PopoverHeader>
        <div className="mt-2">
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-start"
            onClick={handleSignOut}
            disabled={isSubmitting}
          >
            {texts.auth.logout}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
