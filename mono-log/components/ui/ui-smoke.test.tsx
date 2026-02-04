import * as React from "react";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { toast } from "sonner";

import { ThemeProvider } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Toaster } from "@/components/ui/sonner";

function TestProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}

describe("MS3 UI smoke", () => {
  test("Dialog opens and closes", async () => {
    render(
      <TestProviders>
        <Dialog>
          <DialogTrigger asChild>
            <Button type="button">Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog Description</DialogDescription>
            <DialogClose asChild>
              <Button type="button">Close Dialog</Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      </TestProviders>
    );

    fireEvent.click(screen.getByRole("button", { name: "Open Dialog" }));
    expect(await screen.findByText("Dialog Title")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close Dialog" }));
    await waitFor(() =>
      expect(screen.queryByText("Dialog Title")).not.toBeInTheDocument()
    );
  });

  test("Popover opens and closes", async () => {
    render(
      <TestProviders>
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button">Open Popover</Button>
          </PopoverTrigger>
          <PopoverContent>
            <div>Popover Content</div>
          </PopoverContent>
        </Popover>
      </TestProviders>
    );

    fireEvent.click(screen.getByRole("button", { name: "Open Popover" }));
    expect(await screen.findByText("Popover Content")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Open Popover" }));
    await waitFor(() =>
      expect(screen.queryByText("Popover Content")).not.toBeInTheDocument()
    );
  });

  test("Toaster renders toast()", async () => {
    render(
      <TestProviders>
        <Toaster />
      </TestProviders>
    );

    act(() => {
      toast("Hello from toast");
    });

    expect(await screen.findByText("Hello from toast")).toBeInTheDocument();
  });
});
