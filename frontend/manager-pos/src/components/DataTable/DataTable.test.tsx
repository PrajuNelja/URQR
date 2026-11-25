import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DataTable } from "./DataTable";
import type { Column } from "./DataTable.types";

interface Item {
  id: number;
  name: string;
  quantity: number;
}

const rows: Item[] = [
  { id: 1, name: "Item 10", quantity: 10 },
  { id: 2, name: "Item 2", quantity: 2 },
];

const columns: Column<Item>[] = [
  { key: "name", header: "Name", sortable: true },
  { key: "quantity", header: "Quantity", sortable: true },
];

describe("DataTable", () => {
  it("sorts sortable columns and toggles the sort direction", () => {
    render(<DataTable data={rows} columns={columns} rowKey="id" />);

    const table = screen.getByRole("table");
    const nameSortButton = screen.getByRole("button", {
      name: /sort by name/i,
    });

    fireEvent.click(nameSortButton);
    expect(within(table).getAllByRole("row")[1]).toHaveTextContent("Item 2");
    expect(within(table).getAllByRole("row")[2]).toHaveTextContent("Item 10");
    expect(
      within(table).getByRole("columnheader", { name: /name/i }),
    ).toHaveAttribute("aria-sort", "ascending");

    fireEvent.click(nameSortButton);
    expect(within(table).getAllByRole("row")[1]).toHaveTextContent("Item 10");
    expect(within(table).getAllByRole("row")[2]).toHaveTextContent("Item 2");
  });

  it("renders the requested number of loading skeleton rows", () => {
    const { container } = render(
      <DataTable
        data={rows}
        columns={columns}
        rowKey="id"
        isLoading
        loadingRows={3}
      />,
    );

    expect(screen.getByRole("table")).toHaveAttribute("aria-busy", "true");
    expect(container.querySelectorAll("tbody tr")).toHaveLength(3);
  });
});
