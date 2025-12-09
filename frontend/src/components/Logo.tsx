interface LogoProps {
  variant?: "full" | "compact";
  className?: string;
}

function Logo({ variant = "full", className }: LogoProps) {
  const isCompact = variant === "compact";

  return (
    <div className={`flex items-center justify-center ${className || ""}`}>
      <img
        src="/logo.png"
        alt="Cabal Studios"
        className={
          isCompact
            ? "w-10 h-10 object-contain"
            : "w-full max-w-[180px] h-auto object-contain"
        }
        style={{
          objectPosition: "center",
        }}
      />
    </div>
  );
}

export default Logo;
