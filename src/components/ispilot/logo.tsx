import { Link } from "@tanstack/react-router";
import logo from "@/assets/ispilot-logo.png";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  size?: number;
  withWordmark?: boolean;
  to?: string;
  subtitle?: string;
};

export function Logo({
  className,
  size = 32,
  withWordmark = true,
  to,
  subtitle,
}: LogoProps) {
  const content = (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span
        className="relative grid place-items-center rounded-xl border border-border bg-[image:var(--gradient-glass)]"
        style={{ width: size, height: size }}
      >
        <img
          src={logo}
          alt="ISPilot"
          width={size}
          height={size}
          className="h-[70%] w-[70%] object-contain"
        />
      </span>
      {withWordmark ? (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[15px] font-semibold tracking-tight text-foreground">
            ISPilot
          </span>
          {subtitle ? (
            <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {subtitle}
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  );

  if (to) {
    return (
      <Link to={to} className="inline-flex">
        {content}
      </Link>
    );
  }
  return content;
}