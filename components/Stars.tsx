"use client";

import { useMemo } from "react";

export default function Stars() {
  const stars = useMemo(
    () =>
      Array.from({ length: 80 }, (_, i) => {
        const size = Math.random() * 2 + 1;
        return {
          id: i,
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          size,
          delay: `${Math.random() * 4}s`,
          duration: `${3 + Math.random() * 4}s`,
        };
      }),
    []
  );

  return (
    <div className="stars" aria-hidden>
      {stars.map((s) => (
        <span
          key={s.id}
          className="star"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            animationDelay: s.delay,
            animationDuration: s.duration,
          }}
        />
      ))}
    </div>
  );
}
