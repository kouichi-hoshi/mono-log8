import { deriveContentText } from "./contentText";

describe("deriveContentText", () => {
  test("memo: normalizes to single line", () => {
    const text = " hello\nworld \n\n  again ";
    const result = deriveContentText("memo", text);
    expect(result).toBe("hello world again");
  });

  test("note: extracts text from ProseMirror JSON with line breaks", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Line1" }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "Line2" }],
        },
      ],
    };
    const result = deriveContentText("note", doc);
    expect(result).toBe("Line1\nLine2");
  });
});
