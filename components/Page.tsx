import { getCopy, type Locale } from '@/data/i18n';

/**
 * The wrapper that tells the browser what language this page is in and which
 * way it reads.
 *
 * It sits here rather than on `<html>` because only the root layout renders
 * `<html>`, and that layout is shared by all three languages — it cannot know
 * which one is being served. Putting `lang` and `dir` on a wrapper keeps every
 * language at a clean URL (`/`, `/fr/`, `/ar/`) with no redirect, and it is
 * what screen readers and `[dir="rtl"]` selectors read anyway.
 *
 * `app/layout.tsx` mirrors the pair onto `<html>` before first paint, so the
 * scrollbar and the browser's own controls flip too. That script is the
 * improvement; this element is the part that works without it.
 */
export default function Page({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const copy = getCopy(locale);
  return (
    <div lang={locale} dir={copy.dir} className="page">
      {children}
    </div>
  );
}
