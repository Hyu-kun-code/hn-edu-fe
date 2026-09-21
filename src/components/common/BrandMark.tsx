import { Link } from "react-router-dom";
import "./BrandMark.css";

interface BrandMarkProps {
  to?: string;
}

export function BrandMark({ to = "/" }: BrandMarkProps) {
  return (
    <Link to={to} className="app-brand">
      <span className="app-brand-icon" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M4 6.5C4 5.7 4.7 5 5.5 5H12V19H5.5C4.7 19 4 18.3 4 17.5V6.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M20 6.5C20 5.7 19.3 5 18.5 5H12V19H18.5C19.3 19 20 18.3 20 17.5V6.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="app-brand-name">HNEdu</span>
    </Link>
  );
}
