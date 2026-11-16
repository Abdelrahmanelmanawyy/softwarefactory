/**
 * Software Fabrika lockup. The mark is a vector redraw of the SF monogram
 * (cream S, sage F). To use the original artwork instead, drop it in
 * /public/logo-mark.svg and swap the <svg> below for an <img>.
 */
/** Path data shared by the header mark and the browser-tab icon (src/app/icon.svg). */
export const MARK = {
  s: "M30 0H82L72 14H32Q26 14 26 19.5Q26 25 32 25H60Q80 25 80 44.5Q80 64 60 64H0L13 50H57Q64 50 64 44.5Q64 39 57 39H30Q10 39 10 19.5Q10 0 30 0Z",
  /** F: a folded ribbon. Top arm (light), stem (mid) with a dark fold, middle arm (light). */
  arm: "M88 0H120L108 14H84Z",
  stem: "M84 14H97V55L84 64Z",
  fold: "M84 14H97L84 31Z",
  mid: "M97 25H118L108 38H97Z",
};

export function Mark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 64" aria-hidden="true">
      <path fill="var(--logo-s, #F3EFE3)" d={MARK.s} />
      <path fill="#A6C893" d={MARK.arm} />
      <path fill="#7FA36F" d={MARK.stem} />
      <path fill="#4C7142" d={MARK.fold} />
      <path fill="#93B883" d={MARK.mid} />
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
