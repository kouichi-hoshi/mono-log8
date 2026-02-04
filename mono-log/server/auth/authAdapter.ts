export type AppSession = {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

export interface AuthAdapter {
  getSession(): Promise<AppSession | null>;
  signIn(): Promise<void>;
  signOut(): Promise<void>;
}

export const authAdapter: AuthAdapter = {
  async getSession() {
    throw new Error("authAdapter.getSession is not implemented");
  },
  async signIn() {
    throw new Error("authAdapter.signIn is not implemented");
  },
  async signOut() {
    throw new Error("authAdapter.signOut is not implemented");
  },
};

