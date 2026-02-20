"use client";

import { useEffect, useRef } from "react";

const ORBS = [
  { className: "mesh-orb-1", size: 600, top: "-5%", left: "10%" },
  { className: "mesh-orb-2", size: 500, top: "10%", left: "70%" },
  { className: "mesh-orb-3", size: 450, top: "60%", left: "40%" },
  { className: "mesh-orb-4", size: 400, top: "50%", left: "80%" },
  { className: "mesh-orb-5", size: 350, top: "40%", left: "15%" },
];

export function MeshBackground() {
  const orbRefs = useRef<(HTMLDivElement | null)[]>([]);
  const specularTarget = useRef({ x: 50, y: 30 });
  const specularCurrent = useRef({ x: 50, y: 30 });
  const rafId = useRef<number>(0);

  useEffect(() => {
    const root = document.documentElement;

    function animate() {
      specularCurrent.current.x +=
        (specularTarget.current.x - specularCurrent.current.x) * 0.08;
      specularCurrent.current.y +=
        (specularTarget.current.y - specularCurrent.current.y) * 0.08;
      root.style.setProperty(
        "--specular-x",
        `${specularCurrent.current.x}%`
      );
      root.style.setProperty(
        "--specular-y",
        `${specularCurrent.current.y}%`
      );
      rafId.current = requestAnimationFrame(animate);
    }
    rafId.current = requestAnimationFrame(animate);

    function onMouse(e: MouseEvent) {
      specularTarget.current.x = (e.clientX / window.innerWidth) * 100;
      specularTarget.current.y = (e.clientY / window.innerHeight) * 100;

      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      orbRefs.current.forEach((orb, i) => {
        if (!orb) return;
        const depth = (i + 1) * 8;
        orb.style.transform = `translate(${nx * depth}px, ${ny * depth}px)`;
      });
    }
    window.addEventListener("mousemove", onMouse, { passive: true });

    function onOrientation(e: DeviceOrientationEvent) {
      if (e.gamma !== null && e.beta !== null) {
        specularTarget.current.x = ((e.gamma + 90) / 180) * 100;
        specularTarget.current.y = Math.min(
          100,
          Math.max(0, ((e.beta + 45) / 90) * 100)
        );
      }
    }
    window.addEventListener("deviceorientation", onOrientation, {
      passive: true,
    });

    return () => {
      cancelAnimationFrame(rafId.current);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("deviceorientation", onOrientation);
    };
  }, []);

  return (
    <div className="mesh-container" aria-hidden="true">
      {ORBS.map((orb, i) => (
        <div
          key={orb.className}
          ref={(el) => {
            orbRefs.current[i] = el;
          }}
          className={`mesh-orb ${orb.className}`}
          style={{
            width: orb.size,
            height: orb.size,
            top: orb.top,
            left: orb.left,
          }}
        />
      ))}
    </div>
  );
}
