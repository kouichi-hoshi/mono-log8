import { authAdapter } from "./auth/authAdapter";
import { postRepository } from "./posts/postRepository";

describe("connectors", () => {
  test("authAdapter exposes expected methods", () => {
    expect(typeof authAdapter.getSession).toBe("function");
    expect(typeof authAdapter.signIn).toBe("function");
    expect(typeof authAdapter.signOut).toBe("function");
  });

  test("postRepository exposes expected methods", () => {
    expect(typeof postRepository.findMany).toBe("function");
    expect(typeof postRepository.create).toBe("function");
    expect(typeof postRepository.update).toBe("function");
    expect(typeof postRepository.trash).toBe("function");
    expect(typeof postRepository.restore).toBe("function");
    expect(typeof postRepository.hardDelete).toBe("function");
    expect(typeof postRepository.hardDeleteMany).toBe("function");
    expect(typeof postRepository.hardDeleteAllTrashed).toBe("function");
  });
});

