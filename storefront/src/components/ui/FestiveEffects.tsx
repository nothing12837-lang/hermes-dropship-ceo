'use client';

import React, { useEffect, useRef, useState } from 'react';
import { getActiveFestival, INDIAN_FESTIVALS, type ScheduledFestival } from '@/lib/festivals';

export default function FestiveEffects() {
  const [activeFest, setActiveFest] = useState<ScheduledFestival | null>(() => getActiveFestival() || INDIAN_FESTIVALS[0]);
  const [copied, setCopied] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showCanvas, setShowCanvas] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const fest = getActiveFestival() || INDIAN_FESTIVALS[0];
    setActiveFest(fest);
  }, []);

  // Web Audio API synthesised firecracker sound (instant, zero external files)
  const playFirecrackerSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const bufferSize = ctx.sampleRate * 0.15;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();
    } catch {}
  };

  // Canvas Firecrackers Particle Engine
  useEffect(() => {
    if (!activeFest || !showCanvas) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      alpha: number;
      size: number;
      decay: number;
    }

    const particles: Particle[] = [];
    const colors =
      activeFest.id === 'diwali_navratri'
        ? ['#FFD700', '#FF8C00', '#FF4500', '#FFDF00', '#FFF', '#FF6347']
        : activeFest.id === 'holi'
        ? ['#FF1493', '#00FFFF', '#FFD700', '#7B68EE', '#32CD32', '#FF4500']
        : ['#6366F1', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];

    const createBurst = (x: number, y: number) => {
      playFirecrackerSound();
      const count = activeFest.id === 'diwali_navratri' ? 50 : 35;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 1.5;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          size: Math.random() * 3 + 1.5,
          decay: Math.random() * 0.015 + 0.01,
        });
      }
    };

    // Trigger initial bursts on page open
    createBurst(width * 0.25, height * 0.25);
    setTimeout(() => createBurst(width * 0.75, height * 0.22), 400);
    setTimeout(() => createBurst(width * 0.5, height * 0.18), 900);
    setTimeout(() => createBurst(width * 0.35, height * 0.3), 1600);
    setTimeout(() => createBurst(width * 0.65, height * 0.28), 2200);

    // Stop canvas after 7s to preserve 0% CPU & mobile battery
    const stopTimer = setTimeout(() => {
      setShowCanvas(false);
    }, 7000);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(stopTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, [showCanvas, activeFest, soundEnabled]);

  const copyCoupon = () => {
    if (!activeFest) return;
    navigator.clipboard.writeText(activeFest.couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSelectFestival = (festId: string) => {
    if (festId === 'off') {
      setActiveFest(null);
      localStorage.setItem('rareember_festive_override', 'off');
      setShowPicker(false);
      return;
    }
    const found = INDIAN_FESTIVALS.find((f) => f.id === festId) || INDIAN_FESTIVALS[0];
    setActiveFest(found);
    try {
      localStorage.setItem('rareember_festive_override', festId);
    } catch {}
    setShowCanvas(true);
    setShowPicker(false);
  };

  // If off-season / not during a festival, don't show firecrackers or festival banner
  if (!activeFest) {
    return null;
  }

    return (
    <>
      {/* Firecracker Canvas Particles (Pointer events none) */}
      {showCanvas && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 pointer-events-none z-50 transition-opacity duration-1000"
          style={{ width: '100vw', height: '100vh' }}
        />
      )}
    </>
  );
}
