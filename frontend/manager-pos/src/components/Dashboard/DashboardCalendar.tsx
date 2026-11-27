import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, type DateRange } from "react-day-picker";

interface DashboardCalendarProps {
  month: Date;
  selected: DateRange | undefined;
  onMonthChange: (month: Date) => void;
  onSelect: (range: DateRange | undefined) => void;
}

export function DashboardCalendar({
  month,
  selected,
  onMonthChange,
  onSelect,
}: DashboardCalendarProps) {
  return (
    <DayPicker
      mode="range"
      month={month}
      onMonthChange={onMonthChange}
      selected={selected}
      onSelect={onSelect}
      showOutsideDays
      className="dashboard-calendar"
      classNames={{
        root: "dashboard-calendar-root",
        months: "dashboard-calendar-months",
        month: "dashboard-calendar-month",
        month_caption: "dashboard-calendar-caption",
        caption_label: "dashboard-calendar-caption-label",
        nav: "dashboard-calendar-nav",
        button_previous:
          "dashboard-calendar-nav-button dashboard-calendar-nav-previous",
        button_next:
          "dashboard-calendar-nav-button dashboard-calendar-nav-next",
        month_grid: "dashboard-calendar-grid",
        weekdays: "dashboard-calendar-weekdays",
        weekday: "dashboard-calendar-weekday",
        weeks: "dashboard-calendar-weeks",
        week: "dashboard-calendar-week",
        day: "dashboard-calendar-day",
        day_button: "dashboard-calendar-day-button",
        selected: "dashboard-calendar-selected",
        range_start: "dashboard-calendar-range-start",
        range_middle: "dashboard-calendar-range-middle",
        range_end: "dashboard-calendar-range-end",
        today: "dashboard-calendar-today",
        outside: "dashboard-calendar-outside",
        disabled: "dashboard-calendar-disabled",
        hidden: "dashboard-calendar-hidden",
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft size={15} aria-hidden="true" />
          ) : (
            <ChevronRight size={15} aria-hidden="true" />
          ),
      }}
      aria-label="Choose a date range"
    />
  );
}
