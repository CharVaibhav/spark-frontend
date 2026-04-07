'use client';
import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';

export default function MagneticButton({ children, className = '', onClick, disabled }: { children: React.ReactNode, className?: string, onClick?: () => void, disabled?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || disabled) return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.8, ease: "elastic.out(1, 0.3)" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.8, ease: "elastic.out(1, 0.3)" });

    const mouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { height, width, left, top } = el.getBoundingClientRect();
      const x = clientX - (left + width / 2);
      const y = clientY - (top + height / 2);

      // Magnetic pull range
      const distance = Math.hypot(x, y);
      if (distance < 60) {
        xTo(x * 0.4);
        yTo(y * 0.4);
      } else {
        xTo(0);
        yTo(0);
      }
    };

    const mouseLeave = () => {
      xTo(0);
      yTo(0);
    };

    window.addEventListener("mousemove", mouseMove);
    el.addEventListener("mouseleave", mouseLeave);

    return () => {
      window.removeEventListener("mousemove", mouseMove);
      el.removeEventListener("mouseleave", mouseLeave);
    };
  }, [disabled]);

  return (
    <div ref={ref} className={`relative flex items-center justify-center ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}
