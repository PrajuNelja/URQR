import { useState } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { DashboardCalendar } from "./DashboardCalendar";
import {
  dashboardDateFromIso,
  dashboardDateToIso,
  formatDashboardCompactRange,
  formatDashboardRange,
  resolveDashboardDatePreset,
  type DashboardDatePreset,
  type DashboardDateRange,
} from "./DashboardDateRange";

interface DashboardDateRangePickerProps {
  value: DashboardDateRange;
  onApply: (range: DashboardDateRange) => void;
}

const presets: DashboardDatePreset[] = [
  "Today",
  "Yesterday",
  "Last 7D",
  "Last 30D",
  "This Month",
  "Custom",
];

function toCalendarRange(value: DashboardDateRange): DateRange {
  return {
    from: dashboardDateFromIso(value.from),
    to: dashboardDateFromIso(value.to),
  };
}

function fiscalYearLabel(date: Date): string {
  const startYear =
    date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1;
  return `FY ${String(startYear).slice(-2)}-${String(startYear + 1).slice(-2)}`;
}

export function DashboardDateRangePicker({
  value,
  onApply,
}: DashboardDateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [calendarRange, setCalendarRange] = useState<DateRange | undefined>(
    toCalendarRange(value),
  );
  const [month, setMonth] = useState(dashboardDateFromIso(value.from));
  const [activePreset, setActivePreset] =
    useState<DashboardDatePreset>("Last 7D");
  const now = new Date();
  const storeMonth = new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(now);

  const selectPreset = (preset: DashboardDatePreset) => {
    setActivePreset(preset);
    if (preset === "Custom") return;
    const nextRange = resolveDashboardDatePreset(preset);
    setDraft(nextRange);
    setCalendarRange(toCalendarRange(nextRange));
    setMonth(dashboardDateFromIso(nextRange.from));
  };

  const updateDate = (key: keyof DashboardDateRange, date: string) => {
    const nextRange =
      key === "from"
        ? { from: date, to: date > draft.to ? date : draft.to }
        : { from: date < draft.from ? date : draft.from, to: date };
    setDraft(nextRange);
    setCalendarRange(toCalendarRange(nextRange));
    setActivePreset("Custom");
  };

  const selectCalendarRange = (range: DateRange | undefined) => {
    setCalendarRange(range);
    setActivePreset("Custom");
    if (!range?.from) return;
    const from = dashboardDateToIso(range.from);
    const to = dashboardDateToIso(range.to ?? range.from);
    setDraft({ from, to });
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setDraft(value);
      setCalendarRange(toCalendarRange(value));
      setMonth(dashboardDateFromIso(value.from));
    }
  };

  const handleApply = () => {
    onApply(draft);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          id="customRangeButton"
          type="button"
          className="dashboard-range-trigger"
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <CalendarDays size={16} aria-hidden="true" />
          <span>Custom Range</span>
          <span className="dashboard-range-label">
            {formatDashboardCompactRange(value)}
          </span>
          <ChevronDown
            size={16}
            className={
              open
                ? "dashboard-range-chevron dashboard-range-chevron--open"
                : "dashboard-range-chevron"
            }
            aria-hidden="true"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="!w-[min(380px,calc(100vw-32px))] dashboard-date-popover"
        align="end"
        sideOffset={8}
      >
        <div className="dashboard-date-popover-header">
          <h2>Select Date Range</h2>
          <span>Live Store Clock: {storeMonth}</span>
        </div>

        <div className="dashboard-date-presets" aria-label="Date range presets">
          {presets.map((preset) => (
            <button
              type="button"
              key={preset}
              className={
                activePreset === preset
                  ? "dashboard-date-preset dashboard-date-preset--active"
                  : "dashboard-date-preset"
              }
              aria-pressed={activePreset === preset}
              onClick={() => selectPreset(preset)}
            >
              {preset}
            </button>
          ))}
        </div>

        <div className="dashboard-date-inputs">
          <label>
            <span>
              FROM DATE <b>START</b>
            </span>
            <input
              type="date"
              value={draft.from}
              max={draft.to}
              onChange={(event) => updateDate("from", event.target.value)}
            />
          </label>
          <label>
            <span>
              TO DATE <b>END</b>
            </span>
            <input
              type="date"
              value={draft.to}
              min={draft.from}
              onChange={(event) => updateDate("to", event.target.value)}
            />
          </label>
        </div>

        <div className="dashboard-calendar-heading">
          <span>{fiscalYearLabel(month)}</span>
        </div>
        <DashboardCalendar
          month={month}
          selected={calendarRange}
          onMonthChange={setMonth}
          onSelect={selectCalendarRange}
        />

        <div className="dashboard-date-popover-footer">
          <p>{formatDashboardRange(draft, true)}</p>
          <div>
            <button
              type="button"
              className="dashboard-date-cancel"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="dashboard-date-apply"
              onClick={handleApply}
            >
              Apply Range
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
