
import { useEffect, useState } from "react";

interface CurrentDatePillProps {
  className?: string;
}

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);

const getLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export function CurrentDatePill({
  className = "",
}: CurrentDatePillProps) {
  const [today, setToday] = useState(() => new Date());

  useEffect(() => {
    let timerId: number;

    const scheduleUpdate = () => {
      const now = new Date();

      const midnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
      );

      const delay =
        midnight.getTime() - now.getTime() + 100;

      timerId = window.setTimeout(() => {
        setToday(new Date());
        scheduleUpdate();
      }, delay);
    };

    const refresh = () => {
      window.clearTimeout(timerId);
      setToday(new Date());
      scheduleUpdate();
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        refresh();
      }
    };

    scheduleUpdate();

    window.addEventListener("focus", refresh);
    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      window.clearTimeout(timerId);
      window.removeEventListener("focus", refresh);
      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, []);

  return (
    <time
      dateTime={getLocalDate(today)}
      className={`urqr-date-pill ${className}`}
    >
      {formatDate(today)}
    </time>
  );
}
