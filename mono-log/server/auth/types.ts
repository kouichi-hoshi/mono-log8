export type AppSession = {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

export type AuthUser = AppSession["user"];

