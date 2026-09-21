import { useEffect, useRef, useState } from "react";
import { formatDate } from "../../utils/format";
import "./DatePicker.css";

interface DatePickerProps {
  id?: string;
  value: string; // "yyyy-MM-dd" or ""
  onChange: (value: string) => void;
  required?: boolean;
  min?: string; // "yyyy-MM-dd"
}

const WEEKDAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

function toIso(year: number, month: number, day: number): string {
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

function parseIso(value: string): { year: number; month: number; day: number } | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return { year: y, month: m - 1, day: d };
}

function buildWeeks(year: number, month: number): (number | null)[][] {
  const firstDay = new Date(year, month, 1);
  // getDay(): 0=Sun..6=Sat. Convert to Monday-first index (0=Mon..6=Sun).
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

export function DatePicker({ id, value, onChange, required, min }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const today = new Date();
  const parsed = parseIso(value);
  const [viewYear, setViewYear] = useState(parsed?.year ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.month ?? today.getMonth());
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  function openCalendar() {
    const p = parseIso(value);
    setViewYear(p?.year ?? today.getFullYear());
    setViewMonth(p?.month ?? today.getMonth());
    setIsOpen(true);
  }

  function goToPrevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function goToNextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  function selectDay(day: number) {
    onChange(toIso(viewYear, viewMonth, day));
    setIsOpen(false);
  }

  const minParsed = min ? parseIso(min) : null;
  const minIso = minParsed ? toIso(minParsed.year, minParsed.month, minParsed.day) : null;
  const weeks = buildWeeks(viewYear, viewMonth);
  const todayIso = toIso(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <div className="date-picker" ref={rootRef}>
      <div className="date-picker-field">
        <input
          id={id}
          type="text"
          className="date-picker-input"
          readOnly
          required={required}
          value={value ? formatDate(value) : ""}
          placeholder="dd/mm/yyyy"
          onClick={() => (isOpen ? setIsOpen(false) : openCalendar())}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              isOpen ? setIsOpen(false) : openCalendar();
            }
          }}
        />
        {value && (
          <button
            type="button"
            className="date-picker-clear-btn"
            aria-label="Xoá ngày đã chọn"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onChange("");
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
        <button
          type="button"
          className="date-picker-icon-btn"
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => (isOpen ? setIsOpen(false) : openCalendar())}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <rect x="3.5" y="5" width="17" height="15" rx="2" stroke="currentColor" strokeWidth="1.75" />
            <path d="M3.5 9.5H20.5M8 3V6M16 3V6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="date-picker-popover" role="dialog" aria-label="Chọn ngày">
          <div className="date-picker-header">
            <button type="button" className="date-picker-nav" onClick={goToPrevMonth} aria-label="Tháng trước">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <span className="date-picker-title">
              Tháng {viewMonth + 1}/{viewYear}
            </span>
            <button type="button" className="date-picker-nav" onClick={goToNextMonth} aria-label="Tháng sau">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div className="date-picker-weekdays">
            {WEEKDAY_LABELS.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>

          <div className="date-picker-grid">
            {weeks.map((week, wi) =>
              week.map((day, di) => {
                if (day === null) return <span key={`${wi}-${di}`} className="date-picker-cell date-picker-cell--empty" />;
                const iso = toIso(viewYear, viewMonth, day);
                const isSelected = iso === value;
                const isToday = iso === todayIso;
                const isDisabled = minIso ? iso < minIso : false;
                return (
                  <button
                    key={`${wi}-${di}`}
                    type="button"
                    className={`date-picker-cell${isSelected ? " date-picker-cell--selected" : ""}${isToday ? " date-picker-cell--today" : ""}`}
                    disabled={isDisabled}
                    onClick={() => selectDay(day)}
                  >
                    {day}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
