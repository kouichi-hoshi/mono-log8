"use client";

import { Toggle } from "@/components/ui/toggle";
import { texts } from "@/lib/texts";

type FavoriteFilterProps = {
  active: boolean;
  onToggle: () => void;
};

export function FavoriteFilter({ active, onToggle }: FavoriteFilterProps) {
  return (
    <Toggle pressed={active} onPressedChange={onToggle}>
      {texts.post.favorite}
    </Toggle>
  );
}
