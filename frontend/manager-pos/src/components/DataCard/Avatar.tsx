// src/components/DataCard/Avatar.tsx
import { useState } from "react";
import type { AvatarProps } from "./DataCard.types";
import { AVATAR_SIZES, AVATAR_BASE } from "./DataCard.config";

const getInitials = (name?: string): string => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (
    parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
  ).toUpperCase();
};

// Map exact pixel sizes based on your design system
const sizeMap = {
  sm: { width: "32px", height: "32px" },
  md: { width: "40px", height: "40px" },
  lg: { width: "48px", height: "48px" },
};

export const Avatar = ({
  name,
  src,
  size = "md",
  className = "",
}: AvatarProps) => {
  const [imgError, setImgError] = useState(false);

  const classes = [
    AVATAR_BASE,
    AVATAR_SIZES[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const showImage = src && !imgError;

  return (
    <div
      className={classes}
      // FORCING exact size and perfect flex centering via inline styles
      style={{
        width: sizeMap[size].width,
        height: sizeMap[size].height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
      title={name}
      aria-label={name ? `Avatar for ${name}` : "Avatar"}
      role="img"
    >
      {showImage ? (
        <img
          src={src}
          alt={name ?? "User"}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={() => setImgError(true)}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
};

export default Avatar;