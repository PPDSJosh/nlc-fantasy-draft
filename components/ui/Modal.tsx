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
        scale: 0.9,
        y: 20,
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
      }, 0);
    }
    if (overlayRef.current) {
      tl.to(overlayRef.current, {
        opacity: 0,
        duration: 0.2,
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

      // GSAP open animation
      if (overlayRef.current && contentRef.current) {
        gsap.fromTo(
          overlayRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.2, ease: 'power2.out' }
        );
        gsap.fromTo(
          contentRef.current,
          { scale: 0.9, y: 20, opacity: 0 },
          { scale: 1, y: 0, opacity: 1, duration: 0.3, ease: 'back.out(1.4)' }
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    >
      <div
        ref={contentRef}
        className="relative w-full max-w-lg rounded-xl bg-white shadow-2xl"
      >
        <button
          onClick={handleCloseClick}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60"
          aria-label="Close"
        >
          &#10005;
        </button>
        {children}
      </div>
    </div>
  );
}
