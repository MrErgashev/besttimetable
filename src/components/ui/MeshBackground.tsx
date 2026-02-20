"use client";

import { useEffect, useRef, useCallback } from "react";

interface Orb {
  className: string;
  size: number;
  top: string;
  left: string;
  parallaxFactor: number;
}

const ORBS: Orb[] = [
  { className: "mesh-orb-1", size: 600, top: "-5%", left: "10%", parallaxFactor: 0.8 },
  { className: "mesh-orb-2", size: 500, top: "10%", left: "70%", parallaxFactor: 0.5 },
  { className: "mesh-orb-3", size: 450, top: "60%", left: "40%", parallaxFactor: 0.3 },
  { className: "mesh-orb-4", size: 400, top: "50%", left: "80%", parallaxFactor: 0.6 },
  { className: "mesh-orb-5", size: 350, top: "40%", left: "15%", parallaxFactor: 0.4 },
];

export function MeshBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const currentRef = useRef({ x: 0.5, y: 0.5 });
  const rafRef = useRef<number>(0);

  const updateParallax = useCallback(() => {
    // Silliq lerp interpolatsiya
    currentRef.current.x +=
      (mouseRef.current.x - currentRef.current.x) * 0.03;
    currentRef.current.y +=
      (mouseRef.current.y - currentRef.current.y) * 0.03;

    if (containerRef.current) {
      // 0-1 dan -20..+20 piksel oraliqqa
      const offsetX = (currentRef.current.x - 0.5) * 40;
      const offsetY = (currentRef.current.y - 0.5) * 40;
      containerRef.current.style.setProperty(
        "--orb-offset-x",
        `${offsetX}px`
      );
      containerRef.current.style.setProperty(
        "--orb-offset-y",
        `${offsetY}px`
      );
    }

    rafRef.current = requestAnimationFrame(updateParallax);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX / window.innerWidth;
      mouseRef.current.y = e.clientY / window.innerHeight;
    };

    const handleTouchMove = (e: TouchEvent) => {
      mouseRef.current.x = e.touches[0].clientX / window.innerWidth;
      mouseRef.current.y = e.touches[0].clientY / window.innerHeight;
    };

    // Passive listener'lar — scrollni bloklamaslik uchun
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    rafRef.current = requestAnimationFrame(updateParallax);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [updateParallax]);

  return (
    <div
      ref={containerRef}
      className="mesh-container"
      aria-hidden="true"
      style={
        {
          "--orb-offset-x": "0px",
          "--orb-offset-y": "0px",
        } as React.CSSProperties
      }
    >
      {ORBS.map((orb) => (
        <div
          key={orb.className}
          className={`mesh-orb mesh-orb-breathe ${orb.className}`}
          style={
            {
              width: orb.size,
              height: orb.size,
              top: orb.top,
              left: orb.left,
              "--pf": orb.parallaxFactor,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
