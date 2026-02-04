import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import RootLayout from "./layout";

describe("RootLayout", () => {
  test("renders children", () => {
    const html = renderToStaticMarkup(
      <RootLayout>
        <div>child</div>
      </RootLayout>
    );

    expect(html).toContain("child");
  });
});

