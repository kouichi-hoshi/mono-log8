"use client";

import { Button } from "@/components/ui/button";
import { texts } from "@/lib/texts";

type ClearFiltersProps = {
  disabled?: boolean;
  onClick: () => void;
};

export function ClearFilters({ disabled = false, onClick }: ClearFiltersProps) {
  return (
    <Button type="button" size="sm" variant="ghost" disabled={disabled} onClick={onClick}>
      {texts.post.clearFilters}
    </Button>
  );
}
