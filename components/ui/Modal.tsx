'use client';

import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef(false);
  const isVisible = useRef(false);

  const animateClose = useCallback(() => {
    if (isAnimating.current || !isVisible.current) return;
    isAnimating.current = true;

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimating.current = false;
        isVisible.current = false;
        onClose();
      },
    });

    if (contentRef.current) {
      tl.to(contentRef.current, {
        scale: 0.95,
        y: 30,
        opacity: 0,
        duration: 0.25,
        ease: 'power3.in',
      }, 0);
    }
    if (overlayRef.current) {
      tl.to(overlayRef.current, {
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in',
      }, 0);
    }
  }, [onClose]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        animateClose();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      isVisible.current = true;

      if (overlayRef.current && contentRef.current) {
        gsap.fromTo(
          overlayRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.3, ease: 'power2.out' }
        );
        gsap.fromTo(
          contentRef.current,
          { scale: 0.95, y: 30, opacity: 0 },
          { scale: 1, y: 0, opacity: 1, duration: 0.4, ease: 'back.out(1.2)' }
        );
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, animateClose]);

  if (!isOpen) return null;

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) {
      animateClose();
    }
  }

  function handleCloseClick() {
    animateClose();
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm"
    >
      <div
        ref={contentRef}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-cream shadow-2xl"
      >
        <button
          onClick={handleCloseClick}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-ink/50 text-sm text-white backdrop-blur-sm transition-colors hover:bg-ink/70"
          aria-label="Close"
        >
          &#10005;
        </button>
        {children}
      </div>
    </div>
  );
}
