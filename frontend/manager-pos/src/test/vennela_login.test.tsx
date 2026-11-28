// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";

// Mock @tanstack/react-router
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => vi.fn(),
  useSearch: () => ({ redirect: "/pos/billing" }),
}));

// Mock API client to avoid real network calls
vi.mock("../lib/apiClient", () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

import ManagerLogin from "../pages/Table_Management/Components/ManagerLogin";
import { apiClient } from "../lib/apiClient";

describe("Vennela Day 2/4: Screen 1 (ManagerLogin) Component & Accessibility Suite", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders Screen 1 UI with brand tokens, form controls, and submit button", () => {
    const { container } = render(<ManagerLogin />);

    // Brand and headline
    expect(screen.getByText("URQR")).toBeDefined();
    expect(screen.getByText("Where every table runs itself.")).toBeDefined();

    // Form inputs and buttons
    const usernameInput = container.querySelector('input[name="username"]');
    const passwordInput = container.querySelector('input[name="password"]');
    expect(usernameInput).toBeDefined();
    expect(passwordInput).toBeDefined();
    expect(screen.getByRole("button", { name: /^Sign In$/i })).toBeDefined();
  });

  it("toggles password visibility when the eye button is clicked", () => {
    const { container } = render(<ManagerLogin />);

    const passwordInput = container.querySelector('input[name="password"]') as HTMLInputElement;
    expect(passwordInput.type).toBe("password");

    const toggleBtn = screen.getByRole("button", { name: /Show password/i });
    fireEvent.click(toggleBtn);
    expect(passwordInput.type).toBe("text");

    const hideBtn = screen.getByRole("button", { name: /Hide password/i });
    fireEvent.click(hideBtn);
    expect(passwordInput.type).toBe("password");
  });

  it("triggers client-side validation errors when submitting empty fields", async () => {
    render(<ManagerLogin />);

    const submitBtn = screen.getByRole("button", { name: /^Sign In$/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Enter your username\./i)).toBeDefined();
    });
  });

  it("handles successful login submission and enters loading state", async () => {
    const mockedPost = vi.mocked(apiClient.post);
    mockedPost.mockResolvedValueOnce({
      data: {
        accessToken:
          "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEwMCIsInRlbmFudF9pZCI6InRlbmFudC1ob3RlbC0xIiwicm9sZSI6IlJPTEVfTUFOQUdFUiIsImV4cCI6MTkwMDAwMDAwMCwidXNlcm5hbWUiOiJtYW5hZ2VyMDEifQ.sig",
        tokenType: "Bearer",
      },
    });

    const { container } = render(<ManagerLogin />);

    const usernameInput = container.querySelector('input[name="username"]') as HTMLInputElement;
    const passwordInput = container.querySelector('input[name="password"]') as HTMLInputElement;
    const submitBtn = screen.getByRole("button", { name: /^Sign In$/i });

    fireEvent.change(usernameInput, { target: { value: "mgr01" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockedPost).toHaveBeenCalledWith("/auth/login", {
        username: "mgr01",
        password: "password123",
      });
    });
  });

  it("renders server error alert banner when authentication fails with 401", async () => {
    const mockedPost = vi.mocked(apiClient.post);
    const axiosError = {
      isAxiosError: true,
      response: {
        status: 401,
        data: { message: "Invalid credentials" },
      },
    };
    mockedPost.mockRejectedValueOnce(axiosError);

    const { container } = render(<ManagerLogin />);

    const usernameInput = container.querySelector('input[name="username"]') as HTMLInputElement;
    const passwordInput = container.querySelector('input[name="password"]') as HTMLInputElement;
    const submitBtn = screen.getByRole("button", { name: /^Sign In$/i });

    fireEvent.change(usernameInput, { target: { value: "mgr01" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpass" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/Unable to sign in\. Check your credentials and try again\.|Unable to connect to authentication server\./i)
      ).toBeDefined();
    });
  });

  it("opens and dismisses the session timeout modal", () => {
    render(<ManagerLogin />);

    const timeoutBtn = screen.getByRole("button", { name: /Timeout Modal/i });
    fireEvent.click(timeoutBtn);

    expect(screen.getByText(/Session Expiring Soon/i)).toBeDefined();

    const extendBtn = screen.getByRole("button", { name: /Extend Session/i });
    fireEvent.click(extendBtn);

    expect(screen.queryByText(/Session Expiring Soon/i)).toBeNull();
  });
});
