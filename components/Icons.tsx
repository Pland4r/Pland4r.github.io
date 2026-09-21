type IconProps = { className?: string };

export function ArrowRight({ className }: IconProps) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Close({ className }: IconProps) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function Play({ className }: IconProps) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M3 2.2v7.6L10 6z" fill="currentColor" />
    </svg>
  );
}
