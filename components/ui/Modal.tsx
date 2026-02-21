'use client';

import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'default' | 'large';
}

export default function Modal({ isOpen, onClose, children, size = 'default' }: ModalProps) {
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
        scale: 0.96,
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

      if (overlayRef.current && contentRef.current) {
        gsap.fromTo(
          overlayRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.25, ease: 'power2.out' }
        );
        gsap.fromTo(
          contentRef.current,
          { scale: 0.96, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out', delay: 0.05 }
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

  const maxW = size === 'large' ? 'md:max-w-3xl' : 'md:max-w-lg';

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex overflow-y-auto bg-ink/95 backdrop-blur-md md:items-center md:justify-center md:p-4"
    >
      <div
        ref={contentRef}
        className={`relative w-full min-h-screen bg-cream md:min-h-0 ${maxW} md:overflow-hidden md:rounded-xl md:shadow-[0_25px_60px_rgba(0,0,0,0.4)]`}
      >
        <button
          onClick={handleCloseClick}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-ink/40 text-sm text-white/80 backdrop-blur-sm transition-all hover:bg-ink/60 hover:text-white"
          aria-label="Close"
        >
          &#10005;
        </button>
        {children}
      </div>
    </div>
  );
}
