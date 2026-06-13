import { brand } from "./brand";

interface LogoProps {
  size?: number;
  withWordmark?: boolean;
}

/** GSMAXALL logo + optional wordmark. */
export function Logo({ size = 28, withWordmark = true }: LogoProps) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <img
        src={brand.logoUrl}
        alt={`${brand.name} logo`}
        width={size}
        height={size}
        style={{ borderRadius: 6, objectFit: "contain" }}
      />
      {withWordmark && (
        <span
          style={{
            fontWeight: 700,
            letterSpacing: "0.04em",
            background: `linear-gradient(90deg, ${brand.accent.from}, ${brand.accent.to})`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {brand.name}
        </span>
      )}
    </span>
  );
}
