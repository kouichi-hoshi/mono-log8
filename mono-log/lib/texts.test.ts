import { texts } from "./texts";

describe("texts", () => {
  test("has representative toast texts", () => {
    expect(texts.toast.success.saved).toBeTruthy();
    expect(texts.toast.error.loginRequired).toBeTruthy();
  });

  test("formats delete confirm title with count", () => {
    expect(texts.modal.deleteConfirm.titleForCount(3)).toBe(
      "3件の投稿を完全に削除しますか?"
    );
  });
});

