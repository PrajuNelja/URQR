// src/components/DataCard/Avatar.tsx

import { useState } from "react";
import type { AvatarProps } from "./DataCard.types";
import { AVATAR_SIZES, AVATAR_BASE } from "./DataCard.config";

/**
 * getInitials — turns "John Doe" → "JD", "Manager" → "M"
 */
const getInitials = (name?: string): string => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (
    parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
  ).toUpperCase();
};

/**
 * Avatar — circular user badge (image or initials).
 *
 * <Avatar name="John Doe" />
 * <Avatar name="Manager" size="lg" />
 * <Avatar src="/user.jpg" name="Jane" size="sm" />
 */
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
      title={name}
      aria-label={name ? `Avatar for ${name}` : "Avatar"}
      role="img"
    >
      {showImage ? (
        <img
          src={src}
          alt={name ?? "User"}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
};

export default Avatar;