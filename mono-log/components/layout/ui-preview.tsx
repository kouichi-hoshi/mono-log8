"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";

export function UiPreview() {
  const [openDialog, setOpenDialog] = React.useState(false);
  const [openPopover, setOpenPopover] = React.useState(false);

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,360px)_1fr]">
      <section className="rounded-xl border bg-card p-4">
        <h2 className="text-sm font-semibold">一覧（プレースホルダ）</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          MS4以降で投稿一覧が入ります。
        </p>
        <div className="mt-4 grid gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => toast("Toaster が動作しています")}
          >
            Toast を表示
          </Button>

          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline">
                Dialog を開く
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dialog（スモーク）</DialogTitle>
                <DialogDescription>
                  MS3では開閉できることを最小要件とします。
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button">閉じる</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Popover open={openPopover} onOpenChange={setOpenPopover}>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline">
                Popover を開く
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <PopoverHeader>
                <PopoverTitle>Popover（スモーク）</PopoverTitle>
                <PopoverDescription>
                  MS4以降でユーザー操作（ログアウト等）が入ります。
                </PopoverDescription>
              </PopoverHeader>
            </PopoverContent>
          </Popover>
        </div>
      </section>

      <section className="rounded-xl border bg-card p-4">
        <h2 className="text-sm font-semibold">エディタ（プレースホルダ）</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          MS6以降でメモ/ノートのエディタが入ります。
        </p>
        <div className="mt-4 h-56 rounded-lg border bg-muted/30" />
      </section>
    </div>
  );
}

