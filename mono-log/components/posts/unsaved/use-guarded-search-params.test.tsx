import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { texts } from "@/lib/texts";
import {
  UnsavedChangesProvider,
  useHasUnsavedChanges,
  useUnsavedChanges,
} from "@/components/posts/unsaved/unsaved-changes-provider";
import { useGuardedSearchParams } from "@/components/posts/unsaved/use-guarded-search-params";

const push = jest.fn();
const replace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace }),
  useSearchParams: () => new URLSearchParams("mode=memo"),
  usePathname: () => "/",
}));

function TestComponent() {
  useUnsavedChanges("test", true);
  const hasEdits = useHasUnsavedChanges();
  const { guardedPush } = useGuardedSearchParams();

  return (
    <div>
      <span data-testid="has-edits">{String(hasEdits)}</span>
      <button type="button" onClick={() => guardedPush({ mode: "note" })}>
        Go
      </button>
    </div>
  );
}

describe("useGuardedSearchParams", () => {
  beforeEach(() => {
    push.mockReset();
    replace.mockReset();
  });

  test("cancels navigation when discard is rejected", async () => {
    render(
      <UnsavedChangesProvider>
        <TestComponent />
      </UnsavedChangesProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("has-edits")).toHaveTextContent("true")
    );

    fireEvent.click(screen.getByRole("button", { name: "Go" }));
    const keep = await screen.findByRole("button", { name: texts.guard.keep });
    fireEvent.click(keep);

    await waitFor(() => expect(push).not.toHaveBeenCalled());
  });

  test("navigates when discard is confirmed", async () => {
    render(
      <UnsavedChangesProvider>
        <TestComponent />
      </UnsavedChangesProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("has-edits")).toHaveTextContent("true")
    );

    fireEvent.click(screen.getByRole("button", { name: "Go" }));
    const discard = await screen.findByRole("button", {
      name: texts.guard.discard,
    });
    fireEvent.click(discard);

    await waitFor(() => expect(push).toHaveBeenCalledWith("/?mode=note"));
  });
});
