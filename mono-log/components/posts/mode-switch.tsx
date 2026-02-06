"use client";

import { Button } from "@/components/ui/button";
import { texts } from "@/lib/texts";

type ModeSwitchProps = {
  mode: "memo" | "note";
  view: "normal" | "trash";
  hideModeSwitch?: boolean;
  onChangeMode: (mode: "memo" | "note") => void | Promise<void>;
  onChangeView: (view: "normal" | "trash") => void | Promise<void>;
};

export function ModeSwitch({
  mode,
  view,
  hideModeSwitch = false,
  onChangeMode,
  onChangeView,
}: ModeSwitchProps) {
  const handleChangeView = (nextView: "normal" | "trash") => {
    if (nextView === view) return;
    void onChangeView(nextView);
  };

  const handleChangeMode = (nextMode: "memo" | "note") => {
    if (nextMode === mode) return;
    void onChangeMode(nextMode);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={view === "normal" ? "secondary" : "outline"}
          onClick={() => handleChangeView("normal")}
        >
          {texts.posts.listTitle}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={view === "trash" ? "secondary" : "outline"}
          onClick={() => handleChangeView("trash")}
        >
          {texts.trash.title}
        </Button>
      </div>

      {hideModeSwitch ? null : (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={mode === "memo" ? "secondary" : "outline"}
            onClick={() => handleChangeMode("memo")}
          >
            {texts.post.modeMemo}
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === "note" ? "secondary" : "outline"}
            onClick={() => handleChangeMode("note")}
          >
            {texts.post.modeNote}
          </Button>
        </div>
      )}
    </div>
  );
}
