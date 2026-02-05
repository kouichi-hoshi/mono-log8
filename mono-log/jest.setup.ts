import "@testing-library/jest-dom";
import React from "react";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

(globalThis as unknown as { ResizeObserver: typeof ResizeObserver }).ResizeObserver =
  ResizeObserver;

type TestIntersectionObserver = {
  __trigger: (isIntersecting?: boolean) => void;
};

const intersectionObservers: Array<{
  callback: IntersectionObserverCallback;
  elements: Set<Element>;
}> = [];

class IntersectionObserver {
  private callback: IntersectionObserverCallback;
  private elements = new Set<Element>();

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    intersectionObservers.push({ callback, elements: this.elements });
  }

  observe = (element: Element) => {
    this.elements.add(element);
  };

  unobserve = (element: Element) => {
    this.elements.delete(element);
  };

  disconnect = () => {
    this.elements.clear();
  };
}

(globalThis as unknown as { IntersectionObserver: typeof IntersectionObserver }).IntersectionObserver =
  IntersectionObserver;

(globalThis as unknown as TestIntersectionObserver).__trigger = (
  isIntersecting = true
) => {
  for (const obs of intersectionObservers) {
    for (const el of obs.elements) {
      const entry = { isIntersecting, target: el } as IntersectionObserverEntry;
      obs.callback([entry], {} as unknown as IntersectionObserver);
    }
  }
};

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
