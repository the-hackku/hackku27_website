
export function Header() {
  return (
    <header className="relative h-[300px] overflow-hidden bg-transparent">
      
      {/* SVG background */}
      <svg
        viewBox="0 0 1440 380"
        preserveAspectRatio="none"
        className="absolute inset-x-0 top-0 h-full w-full"
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
          fill="#f3f3f3"
        />

        <path
          d="M0 290 L260 290 C340 290 420 290 520 235 C560 215 610 205 660 205 L780 205 C830 205 880 215 920 235 C1020 290 1100 290 1440 290"
          fill="none"
          stroke="#d7d7d7"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>

      {/* Clickable text overlay */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className = "mb-40">HackKU</div>
      </div>
    </header>
  );
}

export default Header;