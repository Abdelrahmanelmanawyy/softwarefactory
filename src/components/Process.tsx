"use client";

import { useRef, useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion";

export default function Process({ dict }: { dict: Dictionary }) {
  const t = dict.process;
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const stations = q(".station") as HTMLElement[];
      stations.forEach((el, i) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 60%",
          end: "bottom 60%",
          onToggle: (self) => self.isActive && setActive(i),
        });
      });
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          q(".rail-fill"),
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: q(".stations")[0], start: "top 60%", end: "bottom 60%", scrub: 0.4 },
          },
        );
      });
    },
    { scope: root },
  );

  return (
    <section className="process light" id="line" ref={root}>
      <div className="wrap process-grid">
        <div className="process-aside">
          <div className="process-sticky">
            <p className="eyebrow" data-reveal>
              {t.eyebrow}
            </p>
            <h2 className="h2" data-reveal>
              {t.title}
            </h2>
            <div className="day-counter" aria-hidden="true">
              <span className="label">{t.day}</span>
              <span className="day-num" key={active}>
                0{active}
              </span>
              <span className="day-name">{t.stations[active].name}</span>
            </div>
          </div>
        </div>

        <ol className="stations">
          <span className="rail" aria-hidden="true">
            <span className="rail-fill" />
          </span>
          {t.stations.map((s, i) => (
            <li className="station" key={s.name} data-on={i <= active ? "" : undefined} data-reveal>
              <span className="station-tag">
                <span className="station-dot" />
                {`ST-0${i + 1}`} · {t.day} 0{i}
              </span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
