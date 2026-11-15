/**
 * Software Fabrika lockup. The mark is a vector redraw of the SF monogram
 * (cream S, sage F). To use the original artwork instead, drop it in
 * /public/logo-mark.svg and swap the <svg> below for an <img>.
 */
export function Mark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 64" aria-hidden="true">
      <path
        fill="var(--logo-s, #F3EFE3)"
        d="M30 0H118L106 14H32Q26 14 26 19.5Q26 25 32 25H60Q80 25 80 44.5Q80 64 60 64H0L13 50H57Q64 50 64 44.5Q64 39 57 39H30Q10 39 10 19.5Q10 0 30 0Z"
      />
      <path fill="var(--logo-f, #7FA36F)" d="M86 25H118L107 39H98V58Q92 63 86 64Z" />
    </svg>
  );
}

export default function Logo({ brand }: { brand: string }) {
  const [first, ...rest] = brand.split(" ");
  return (
    <span className="logo">
      <Mark className="logo-mark" />
      <span className="logo-rule" aria-hidden="true" />
      <span className="logo-word">
        <span className="logo-top">{first}</span>
        <span className="logo-bottom">{rest.join(" ")}</span>
      </span>
    </span>
  );
}
