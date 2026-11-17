/**
 * The Authentic Creations mark: a lowercase "a" beside a solid block.
 * Redrawn as SVG from the client's profile logo so it stays sharp at any size.
 */
export function LogoMark({ className = "", title = "Authentic Creations" }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 322 150" className={className} role="img" aria-label={title} fill="currentColor">
      <path
        fillRule="evenodd"
        d="M2 75a73 73 0 1 0 146 0a73 73 0 1 0 -146 0Z M42 77a36 36 0 1 0 72 0a36 36 0 1 0 -72 0Z"
      />
      <rect x="121" y="0" width="37" height="150" rx="3" />
      <rect x="184" y="1" width="138" height="148" />
    </svg>
  );
}

/** Round avatar version (black mark on white), as on TikTok. */
export function LogoBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-grid place-items-center rounded-full bg-white text-black ${className}`}>
      <LogoMark className="w-[58%]" />
    </span>
  );
}
