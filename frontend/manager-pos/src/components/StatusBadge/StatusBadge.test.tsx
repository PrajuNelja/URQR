// @vitest-environment jsdom
import "../../test/setup";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusBadge } from "./StatusBadge";

describe("StatusBadge", () => {
  it("renders Out of Stock with the error color", () => {
    render(<StatusBadge status="out-of-stock" />);
    expect(screen.getByText("Out of Stock")).toHaveClass(
      "bg-error-bg",
      "text-error",
    );
  });

  it("renders stock inventory badges correctly", () => {
    const { rerender } = render(<StatusBadge status="in-stock" />);
    expect(screen.getByText("In stock")).toHaveClass("bg-surface-alt", "text-text");

    rerender(<StatusBadge status="low-stock" />);
    expect(screen.getByText("Low stock")).toHaveClass("bg-warning-bg", "text-warning");

    rerender(<StatusBadge status="sold-out" />);
    expect(screen.getByText("Sold out")).toHaveClass("bg-error-bg", "text-error");
  });

  it("renders the Order Lifecycle pills correctly", () => {
    const { rerender } = render(<StatusBadge status="preparing" />);
    expect(screen.getByText("Preparing")).toHaveClass("bg-primary", "text-on-primary");

    rerender(<StatusBadge status="queued" />);
    expect(screen.getByText("Queued")).toHaveClass("bg-bg", "border-border");

    rerender(<StatusBadge status="voided" />);
    expect(screen.getByText("Voided")).toHaveClass("bg-error", "text-on-primary");

    rerender(<StatusBadge status="paid" />);
    expect(screen.getByText("Paid")).toHaveClass("bg-surface", "text-primary", "border-primary");
  });
});