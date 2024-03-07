import React from "react";

/**
 * Used by the axe-core accessibility testing library to report accessibility issues.
 * @param App The React component to test.
 * @param config An optional configuration object for axe-core.
 */
export const reportAccessibility = async (
  App: typeof React,
  config?: Record<string, unknown>,
): Promise<void> => {
  if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
    const axe = await import("@axe-core/react");
    const ReactDOM = await import("react-dom");

    axe.default(App, ReactDOM, 1000, config);
  }
};
