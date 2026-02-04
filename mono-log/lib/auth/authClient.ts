export class AuthClientError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const request = async (method: "POST" | "DELETE") => {
  const response = await fetch("/api/auth/stub", {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new AuthClientError(
      response.status,
      `Auth request failed with status ${response.status}`
    );
  }
};

export const authClient = {
  signIn: async () => request("POST"),
  signOut: async () => request("DELETE"),
};

