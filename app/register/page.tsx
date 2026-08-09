import { Suspense } from "react";
import { Register } from "@/components/pages/register";

export default function RegisterPage() {
  return (
    <div
      className="relative flex flex-col items-center justify-center px-4"
      style={{ marginTop: "-2vw" }}>
      <div
        className="border bg-white page-card w-full flex flex-col"
        style={{
          borderWidth: "2px",
          borderBottomLeftRadius: "clamp(0.75rem, 4vw, 1.5rem)",
          borderBottomRightRadius: "clamp(0.75rem, 4vw, 1.5rem)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -2px 4px rgba(0,0,0,0.08), 0 6px 12px rgba(0,0,0,0.12)",
          width: "100%",
          maxWidth: "650px",
          paddingLeft: "1rem",
          paddingRight: "1rem",
          paddingTop: "3rem",
          paddingBottom: "3rem",
          gap: "1rem",
          minHeight: "70vh",
        }}>
        <Suspense fallback={<div>Loading registration form...</div>}>
          <Register />
        </Suspense>
      </div>
    </div>
  );
}
