import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { UserMenu } from "@/components/auth/user-menu";
import { authClient } from "@/lib/auth/authClient";

const mockRouter = {
  refresh: jest.fn(),
  replace: jest.fn(),
};

jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}));

jest.mock("@/lib/auth/authClient", () => ({
  authClient: {
    signIn: jest.fn(),
    signOut: jest.fn(),
  },
}));

describe("UserMenu", () => {
  beforeEach(() => {
    mockRouter.refresh.mockReset();
    mockRouter.replace.mockReset();
    (authClient.signOut as jest.Mock).mockReset();
  });

  test("signs out and redirects on success", async () => {
    (authClient.signOut as jest.Mock).mockResolvedValue(undefined);

    render(
      <UserMenu
        user={{
          id: "stub-user-1",
          name: "Stub User",
          email: "stub@example.com",
        }}
      />
    );

    fireEvent.click(screen.getByLabelText("ユーザーメニュー"));
    fireEvent.click(await screen.findByRole("button", { name: "ログアウト" }));

    await waitFor(() => expect(authClient.signOut).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith("/"));
    await waitFor(() => expect(mockRouter.refresh).toHaveBeenCalledTimes(1));
  });
});

