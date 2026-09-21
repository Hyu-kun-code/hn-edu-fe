import "./LoadingIndicator.css";

interface LoadingIndicatorProps {
  label?: string;
}

export function LoadingIndicator({ label = "Đang tải..." }: LoadingIndicatorProps) {
  return (
    <p className="loading-indicator">
      <span className="loading-spinner" aria-hidden="true" />
      {label}
    </p>
  );
}
