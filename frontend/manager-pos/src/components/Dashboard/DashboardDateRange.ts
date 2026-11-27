export type DashboardDatePreset =
  "Today" | "Yesterday" | "Last 7D" | "Last 30D" | "This Month" | "Custom";

export interface DashboardDateRange {
  from: string;
  to: string;
}

export function dashboardDateFromIso(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatDashboardCompactRange(range: DashboardDateRange): string {
  const from = dashboardDateFromIso(range.from);
  const to = dashboardDateFromIso(range.to);
  const fromYear = from.getFullYear();
  const toYear = to.getFullYear();
  const formatDay = new Intl.DateTimeFormat("en-GB", { day: "2-digit" });
  const formatMonth = new Intl.DateTimeFormat("en-GB", { month: "short" });

  if (from.getTime() === to.getTime()) {
    return `${formatDay.format(from)} ${formatMonth.format(from)}`;
  }
  if (fromYear !== toYear) {
    return `${formatDashboardDate(from)} – ${formatDashboardDate(to)}`;
  }
  if (from.getMonth() === to.getMonth()) {
    return `${formatDay.format(from)}–${formatDay.format(to)} ${formatMonth.format(to)}`;
  }
  return `${formatDashboardDate(from)} – ${formatDay.format(to)} ${formatMonth.format(to)}`;
}

function formatDashboardDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function dashboardDateToIso(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function resolveDashboardDatePreset(
  preset: Exclude<DashboardDatePreset, "Custom">,
  now = new Date(),
): DashboardDateRange {
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(end);

  if (preset === "Yesterday") {
    start.setDate(start.getDate() - 1);
    end.setDate(end.getDate() - 1);
  } else if (preset === "Last 7D") {
    start.setDate(start.getDate() - 6);
  } else if (preset === "Last 30D") {
    start.setDate(start.getDate() - 29);
  } else if (preset === "This Month") {
    start.setDate(1);
  }

  return {
    from: dashboardDateToIso(start),
    to: dashboardDateToIso(end),
  };
}

export function formatDashboardRange(
  range: DashboardDateRange,
  includeYear = false,
): string {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    ...(includeYear ? { year: "numeric" } : {}),
  });
  const from = formatter.format(dashboardDateFromIso(range.from));
  const to = formatter.format(dashboardDateFromIso(range.to));
  const days =
    Math.round(
      (Date.UTC(
        dashboardDateFromIso(range.to).getFullYear(),
        dashboardDateFromIso(range.to).getMonth(),
        dashboardDateFromIso(range.to).getDate(),
      ) -
        Date.UTC(
          dashboardDateFromIso(range.from).getFullYear(),
          dashboardDateFromIso(range.from).getMonth(),
          dashboardDateFromIso(range.from).getDate(),
        )) /
        86_400_000,
    ) + 1;

  if (!includeYear) return `${from} – ${to}`;
  return `${from} – ${to} (${days} ${days === 1 ? "day" : "days"})`;
}
