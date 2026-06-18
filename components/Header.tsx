import Image from "next/image";

export function Header() {
  return (
    <header
      className="relative overflow-hidden bg-transparent"
      style={{ height: "clamp(180px, 22vh, 340px)" }}
    >
      {/* SVG wave cutout */}
      <svg
        viewBox="0 0 1440 380"
        preserveAspectRatio="none"
        className="absolute inset-x-0 top-0 h-full w-full"
        style={{ pointerEvents: "none" }}
      >
        <path
          d="
            M 0 0
            L 1440 0
            L 1440 290
            C 1100 290 1020 290 920 235
            C 880 215 830 205 780 205
            L 660 205
            C 610 205 560 215 520 235
            C 420 290 340 290 260 290
            L 0 290
            Z
          "
          fill="#F3F4F6"
        />
        <path
          d="M0 290 L260 290 C340 290 420 290 520 235 C560 215 610 205 660 205 L780 205 C830 205 880 215 920 235 C1020 290 1100 290 1440 290"
          fill="none"
          stroke="#d7d7d7"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>

      <div
        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ top: "25%" }}
      >
        <Image
          src="/images/branding/logo_color_grey.png"
          alt="HackKU"
          width={320}
          height={80}
          style={{ height: "clamp(40px, 11vh, 120px)", width: "auto" }}
          priority
        />
      </div>
    </header>
  );
}

export default Header;
