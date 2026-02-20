"use client";

import { useEffect, useRef, useCallback } from "react";

type InputMode = "mouse" | "gyroscope" | "auto";

interface SpecularState {
  x: number;
  y: number;
}

/**
 * Mouse/gyroscope/auto-drift orqali --specular-x va --specular-y
 * CSS custom property'larini :root da boshqaradi.
 *
 * Prioritet: gyroscope (mobil) > mouse (desktop) > auto (fallback animatsiya)
 */
export function useSpecularLight() {
  const targetRef = useRef<SpecularState>({ x: 50, y: 30 });
  const currentRef = useRef<SpecularState>({ x: 50, y: 30 });
  const modeRef = useRef<InputMode>("auto");
  const rafRef = useRef<number>(0);
  const lastInputRef = useRef<number>(0);
  const autoAngleRef = useRef<number>(0);
  const permissionAskedRef = useRef(false);

  const animate = useCallback(() => {
    const now = Date.now();
    const lerpFactor = 0.04;

    // 5 soniya input bo'lmasa, auto rejimga o'tish
    if (now - lastInputRef.current > 5000 && modeRef.current !== "auto") {
      modeRef.current = "auto";
    }

    // Auto rejim: sekin aylana harakati
    if (modeRef.current === "auto") {
      autoAngleRef.current += 0.003;
      targetRef.current.x = 50 + Math.cos(autoAngleRef.current) * 30;
      targetRef.current.y = 35 + Math.sin(autoAngleRef.current * 0.7) * 20;
    }

    // Lerp — silliq interpolatsiya
    currentRef.current.x +=
      (targetRef.current.x - currentRef.current.x) * lerpFactor;
    currentRef.current.y +=
      (targetRef.current.y - currentRef.current.y) * lerpFactor;

    // CSS custom property'larni yangilash
    const root = document.documentElement;
    root.style.setProperty(
      "--specular-x",
      `${currentRef.current.x.toFixed(1)}%`
    );
    root.style.setProperty(
      "--specular-y",
      `${currentRef.current.y.toFixed(1)}%`
    );

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    // Desktop: mousemove
    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current.x = (e.clientX / window.innerWidth) * 100;
      targetRef.current.y = (e.clientY / window.innerHeight) * 100;
      modeRef.current = "mouse";
      lastInputRef.current = Date.now();
    };

    // Mobil: touch
    const handleTouchMove = (e: TouchEvent) => {
      targetRef.current.x =
        (e.touches[0].clientX / window.innerWidth) * 100;
      targetRef.current.y =
        (e.touches[0].clientY / window.innerHeight) * 100;
      modeRef.current = "mouse";
      lastInputRef.current = Date.now();
    };

    // Mobil: deviceorientation (gyroscope)
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;
      // gamma: -90..90 (chap-o'ng), beta: -180..180 (old-orqa)
      const x = Math.max(0, Math.min(100, ((e.gamma + 45) / 90) * 100));
      const y = Math.max(
        0,
        Math.min(100, ((e.beta - 20) / 60) * 100)
      );
      targetRef.current.x = x;
      targetRef.current.y = y;
      modeRef.current = "gyroscope";
      lastInputRef.current = Date.now();
    };

    // iOS 13+ permission oqimi
    const tryGyroscope = async () => {
      if (permissionAskedRef.current) return;

      const DOE = DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<"granted" | "denied">;
      };

      if (typeof DOE.requestPermission === "function") {
        // iOS 13+: birinchi teginishda ruxsat so'rash
        const handleFirstInteraction = async () => {
          permissionAskedRef.current = true;
          try {
            const result = await DOE.requestPermission!();
            if (result === "granted") {
              window.addEventListener("deviceorientation", handleOrientation, {
                passive: true,
              });
            }
          } catch {
            // Rad etildi — auto rejim davom etadi
          }
          document.removeEventListener("click", handleFirstInteraction);
        };
        document.addEventListener("click", handleFirstInteraction, {
          once: true,
        });
      } else {
        // Android yoki eski iOS: ruxsat shart emas
        window.addEventListener("deviceorientation", handleOrientation, {
          passive: true,
        });
      }
    };

    // Tinglovchilarni o'rnatish
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    tryGyroscope();
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("deviceorientation", handleOrientation);
      cancelAnimationFrame(rafRef.current);
      // CSS property'larni tozalash
      const root = document.documentElement;
      root.style.removeProperty("--specular-x");
      root.style.removeProperty("--specular-y");
    };
  }, [animate]);
}
