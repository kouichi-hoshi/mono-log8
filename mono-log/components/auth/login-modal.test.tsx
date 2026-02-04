import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { AuthModalProvider } from "@/components/auth/auth-modal-provider";
import { LoginButton } from "@/components/auth/login-button";
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

describe("LoginModal", () => {
  beforeEach(() => {
    mockRouter.refresh.mockReset();
    mockRouter.replace.mockReset();
    (authClient.signIn as jest.Mock).mockReset();
  });

  test("opens and closes the modal", async () => {
    render(
      <AuthModalProvider>
        <LoginButton />
      </AuthModalProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "ログイン" }));
    expect(
      await screen.findByRole("button", { name: "Googleでログイン" })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("閉じる"));

    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Googleでログイン" })
      ).not.toBeInTheDocument()
    );
  });

  test("calls authClient.signIn and refreshes on success", async () => {
    (authClient.signIn as jest.Mock).mockResolvedValue(undefined);

    render(
      <AuthModalProvider>
        <LoginButton />
      </AuthModalProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "ログイン" }));
    fireEvent.click(
      await screen.findByRole("button", { name: "Googleでログイン" })
    );

    await waitFor(() => expect(authClient.signIn).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(mockRouter.refresh).toHaveBeenCalledTimes(1));
  });
});

