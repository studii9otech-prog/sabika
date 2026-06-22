"use client";

import React from "react";
import ErrorFallback from "./ErrorFallback";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Custom fallback title shown to the user */
  fallbackTitle?: string;
  /** Custom fallback description shown to the user */
  fallbackDescription?: string;
  /** If true, renders a compact inline fallback instead of a full-page one */
  inline?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

/**
 * A class-based React Error Boundary.
 *
 * Wrap any subtree that might throw (data components, API-driven sections) with
 * this component.  If the subtree throws, the error is caught here so the rest
 * of the page continues to work normally.
 *
 * Usage:
 *   <ErrorBoundary fallbackTitle="تعذّر تحميل التحليلات">
 *     <AnalysisCards />
 *   </ErrorBoundary>
 */
export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error?.message ?? "Unknown error" };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to console only — never surface raw errors to the user
    console.error("[ErrorBoundary] Caught error:", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: "" });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          title={this.props.fallbackTitle}
          description={this.props.fallbackDescription}
          onRetry={this.handleReset}
          inline={this.props.inline}
        />
      );
    }

    return this.props.children;
  }
}
