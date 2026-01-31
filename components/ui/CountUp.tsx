'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface CountUpProps {
  value: number;
  className?: string;
}

export default function CountUp({ value, className = '' }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const prevValue = useRef(0);

  useEffect(() => {
    if (!ref.current) return;

    const obj = { val: prevValue.current };
    gsap.to(obj, {
      val: value,
      duration: 0.8,
      ease: 'power2.out',
      onUpdate: () => {
        if (ref.current) {
          ref.current.textContent = Math.round(obj.val).toString();
        }
      },
    });

    prevValue.current = value;
  }, [value]);

  return <span ref={ref} className={`font-mono tabular-nums ${className}`}>{value}</span>;
}
