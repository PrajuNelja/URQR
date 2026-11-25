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
});
