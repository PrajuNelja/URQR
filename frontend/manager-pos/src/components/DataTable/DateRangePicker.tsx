// src/components/DataTable/DateRangePicker.tsx

import type { DateRangePickerProps } from "./DataTable.types";
import { dateRangePickerConfig } from "./DataTable.config";
import { DateInput } from "../InputField/DateInput";

/**
 * DateRangePicker — compact "From / To" pill (matches reference `.rpd`).
 *
 * <DateRangePicker
 *   value={{ from: "2026-11-01", to: "2026-11-18" }}
 *   onChange={(range) => setRange(range)}
 * />
 */
export const DateRangePicker = ({
  value,
  onChange,
  fromLabel = "From",
  toLabel = "To",
  className = "",
}: DateRangePickerProps) => {
  const handleFrom = (from: string) => {
    // Prevent from > to
    const to = from > value.to ? from : value.to;
    onChange({ from, to });
  };

  const handleTo = (to: string) => {
    // Prevent to < from
    const from = to < value.from ? to : value.from;
    onChange({ from, to });
  };

  return (
    <div
      className={`${dateRangePickerConfig.wrapper} ${className}`.trim()}
    >
      <div className={dateRangePickerConfig.group}>
        <label className={dateRangePickerConfig.label} htmlFor="drp-from">
          {fromLabel}
        </label>
        <DateInput
          id="drp-from"
          value={value.from}
          max={value.to}
          onChange={(e) => handleFrom(e.target.value)}
        />
      </div>

      <div className={dateRangePickerConfig.group}>
        <label className={dateRangePickerConfig.label} htmlFor="drp-to">
          {toLabel}
        </label>
        <DateInput
          id="drp-to"
          value={value.to}
          min={value.from}
          onChange={(e) => handleTo(e.target.value)}
        />
      </div>
    </div>
  );
};

export default DateRangePicker;