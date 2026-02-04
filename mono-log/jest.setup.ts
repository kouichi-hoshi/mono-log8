import "@testing-library/jest-dom";
import React from "react";

jest.mock("next/image", () => ({
  __esModule: true,
  default: function NextImage(props: Record<string, unknown>) {
    const alt = (props as { alt?: string }).alt ?? "";
    return React.createElement("img", { ...props, alt });
  },
}));

jest.mock("next/font/google", () => ({
  Geist: () => ({ variable: "--font-geist-sans" }),
  Geist_Mono: () => ({ variable: "--font-geist-mono" }),
}));
