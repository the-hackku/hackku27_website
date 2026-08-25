import { CSSProperties, ReactNode } from "react";

export const pageCardStyle: CSSProperties = {
  borderWidth: "2px",
  borderBottomLeftRadius: "clamp(2.75rem, 4vw, 1.5rem)",
  borderBottomRightRadius: "clamp(2.75rem, 4vw, 1.5rem)",
  boxShadow: `
    inset 0 1px 0 rgba(255,255,255,0.9),
    inset 0 -2px 4px rgba(0,0,0,0.08),
    0 6px 12px rgba(0,0,0,0.12)`,
};

interface PageCardProps {
  children: ReactNode;
  className?: string;
  wrapperClassName?: string;
  wrapperStyle?: CSSProperties;
  maxWidth?: string;
  style?: CSSProperties;
}

/**
 * Shared card shell used across pages (home, register, etc.).
 * Matches the curved-top card aesthetic from the home page.
 */
export function PageCard({ children, className = "", wrapperClassName = "", wrapperStyle, maxWidth = "650px", style }: PageCardProps) {
  return (
    <div className={`relative flex flex-col items-center justify-center w-full ${wrapperClassName}`} style={wrapperStyle}>
      <div
        className={`border bg-white w-full flex flex-col page-card ${className}`}
        style={{
          ...pageCardStyle,
          maxWidth,
          padding: "clamp(1.25rem, 3vw, 2.5rem)",
          gap: "1rem",
          ...style,
        }}
      >
        {children}
      </div>
    </div>
  );
}
