import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  padding?: "none" | "sm" | "md" | "lg";
}

export default function Card({
  children,
  className = "",
  hover = false,
  onClick,
  padding = "md",
}: CardProps) {
  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-5",
    lg: "p-6",
  };

  return (
    <div
      className={`
        bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-white/5
        shadow-card transition-all duration-300
        ${hover ? "hover:bg-slate-800/80 hover:shadow-card-hover hover:border-white/10 hover:-translate-y-0.5 cursor-pointer" : ""}
        ${paddings[padding]}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
