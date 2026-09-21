import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import "./TimePicker.css";

interface TimePickerProps {
  id?: string;
  value: string; // "HH:mm" or ""
  onChange: (value: string) => void;
  required?: boolean;
  minuteStep?: number;
}

type DialMode = "hour" | "minute";

const VIEWBOX_SIZE = 256;
const CENTER = 128;
const OUTER_RADIUS = 100;
const INNER_RADIUS = 62;
const RING_THRESHOLD = (OUTER_RADIUS + INNER_RADIUS) / 2;

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function parseTime(value: string): { hour: number; minute: number } {
  if (!value) return { hour: 0, minute: 0 };
  const [h, m] = value.split(":").map(Number);
  return { hour: Number.isNaN(h) ? 0 : h, minute: Number.isNaN(m) ? 0 : m };
}

function polarPoint(radius: number, index: number, segments: number) {
  const angle = (index * 360) / segments - 90;
  const rad = (angle * Math.PI) / 180;
  return { x: CENTER + radius * Math.cos(rad), y: CENTER + radius * Math.sin(rad) };
}

export function TimePicker({ id, value, onChange, required, minuteStep = 5 }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<DialMode>("hour");
  const [draftHour, setDraftHour] = useState(0);
  const [draftMinute, setDraftMinute] = useState(0);
  const isDraggingRef = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

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

  function openPicker() {
    const parsed = parseTime(value);
    setDraftHour(parsed.hour);
    setDraftMinute(parsed.minute);
    setMode("hour");
    setIsOpen(true);
  }

  function toggle() {
    isOpen ? setIsOpen(false) : openPicker();
  }

  function pointFromEvent(e: ReactPointerEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    return {
      x: ((e.clientX - rect.left) / rect.width) * VIEWBOX_SIZE,
      y: ((e.clientY - rect.top) / rect.height) * VIEWBOX_SIZE,
    };
  }

  function updateFromPoint(x: number, y: number) {
    const dx = x - CENTER;
    const dy = y - CENTER;
    let angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    if (angle < 0) angle += 360;

    if (mode === "hour") {
      const index = Math.round(angle / 30) % 12;
      const dist = Math.hypot(dx, dy);
      setDraftHour(dist > RING_THRESHOLD ? index : index + 12);
    } else {
      const rawMinute = Math.round(angle / 6) % 60;
      const snapped = (Math.round(rawMinute / minuteStep) * minuteStep) % 60;
      setDraftMinute(snapped);
    }
  }

  function handlePointerDown(e: ReactPointerEvent<SVGSVGElement>) {
    const point = pointFromEvent(e);
    if (!point) return;
    svgRef.current?.setPointerCapture(e.pointerId);
    isDraggingRef.current = true;
    updateFromPoint(point.x, point.y);
  }

  function handlePointerMove(e: ReactPointerEvent<SVGSVGElement>) {
    if (!isDraggingRef.current) return;
    const point = pointFromEvent(e);
    if (!point) return;
    updateFromPoint(point.x, point.y);
  }

  function handlePointerUp() {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (mode === "hour") setMode("minute");
  }

  function handleConfirm() {
    onChange(`${pad(draftHour)}:${pad(draftMinute)}`);
    setIsOpen(false);
  }

  const handAngleIndex = mode === "hour" ? draftHour % 12 : Math.round(draftMinute / minuteStep) % 12;
  const handRadius = mode === "hour" && draftHour >= 12 ? INNER_RADIUS : OUTER_RADIUS;
  const handPoint = polarPoint(handRadius, handAngleIndex, 12);

  return (
    <div className="time-picker" ref={rootRef}>
      <div className="time-picker-field">
        <input
          id={id}
          type="text"
          className="time-picker-input"
          readOnly
          required={required}
          value={value}
          placeholder="--:--"
          onClick={toggle}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggle();
            }
          }}
        />
        {value && (
          <button
            type="button"
            className="time-picker-clear-btn"
            aria-label="Xoá giờ đã chọn"
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
          className="time-picker-icon-btn"
          tabIndex={-1}
          aria-hidden="true"
          onClick={toggle}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.75" />
            <path d="M12 8V12L14.5 14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="time-picker-popover" role="dialog" aria-label="Chọn giờ">
          <div className="time-picker-header">
            <button
              type="button"
              className={`time-picker-header-segment${mode === "hour" ? " time-picker-header-segment--active" : ""}`}
              onClick={() => setMode("hour")}
            >
              {pad(draftHour)}
            </button>
            <span className="time-picker-header-sep">:</span>
            <button
              type="button"
              className={`time-picker-header-segment${mode === "minute" ? " time-picker-header-segment--active" : ""}`}
              onClick={() => setMode("minute")}
            >
              {pad(draftMinute)}
            </button>
          </div>

          <svg
            ref={svgRef}
            className="time-picker-dial"
            viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <circle cx={CENTER} cy={CENTER} r={118} className="time-picker-dial-face" />

            {mode === "hour"
              ? Array.from({ length: 24 }, (_, hour) => {
                  const isOuter = hour < 12;
                  const index = isOuter ? hour : hour - 12;
                  const p = polarPoint(isOuter ? OUTER_RADIUS : INNER_RADIUS, index, 12);
                  const selected = draftHour === hour;
                  return (
                    <g key={hour}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={isOuter ? 17 : 15}
                        className={`time-picker-dial-cell${selected ? " time-picker-dial-cell--selected" : ""}${isOuter ? "" : " time-picker-dial-cell--minor"}`}
                      />
                      <text
                        x={p.x}
                        y={p.y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className={`time-picker-dial-label${selected ? " time-picker-dial-label--selected" : ""}${isOuter ? "" : " time-picker-dial-label--minor"}`}
                      >
                        {pad(hour)}
                      </text>
                    </g>
                  );
                })
              : Array.from({ length: 12 }, (_, i) => {
                  const val = (i * minuteStep) % 60;
                  const p = polarPoint(OUTER_RADIUS, i, 12);
                  const selected = draftMinute === val;
                  return (
                    <g key={i}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={17}
                        className={`time-picker-dial-cell${selected ? " time-picker-dial-cell--selected" : ""}`}
                      />
                      <text
                        x={p.x}
                        y={p.y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className={`time-picker-dial-label${selected ? " time-picker-dial-label--selected" : ""}`}
                      >
                        {pad(val)}
                      </text>
                    </g>
                  );
                })}

            <line x1={CENTER} y1={CENTER} x2={handPoint.x} y2={handPoint.y} className="time-picker-dial-hand" />
            <circle cx={CENTER} cy={CENTER} r={4} className="time-picker-dial-center" />
          </svg>

          <div className="time-picker-actions">
            <button type="button" className="time-picker-btn time-picker-btn--text" onClick={() => setIsOpen(false)}>
              Huỷ
            </button>
            <button type="button" className="time-picker-btn time-picker-btn--filled" onClick={handleConfirm}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
