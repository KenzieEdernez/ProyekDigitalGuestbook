interface WaveDividerProps {
  fill?: string;
  flip?: boolean;
  className?: string;
}

export default function WaveDivider({
  fill = "#f8f6f2",
  flip = false,
  className = "",
}: WaveDividerProps) {
  return (
    <div
      className={`pointer-events-none w-full overflow-hidden leading-[0] ${flip ? "rotate-180" : ""} ${className}`}
      aria-hidden
    >
      <svg
        viewBox="0 0 1440 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="block w-full"
        preserveAspectRatio="none"
      >
        <path
          d="M0 40C240 80 480 0 720 40C960 80 1200 0 1440 40V80H0V40Z"
          fill={fill}
        />
      </svg>
    </div>
  );
}
