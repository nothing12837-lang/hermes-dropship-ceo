'use client';

import { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  magneticStrength?: number;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
}

const variantStyles = {
  primary: {
    base: 'bg-gradient-ember text-white',
    hover: '',
    magnetic: 'rgba(255, 90, 54, 0.4)',
  },
  secondary: {
    base: 'bg-[#0B0B0F] text-white',
    hover: '',
    magnetic: 'rgba(11, 11, 15, 0.25)',
  },
  ghost: {
    base: 'bg-transparent text-text-primary',
    hover: '',
    magnetic: 'rgba(255, 90, 54, 0.15)',
  },
  outline: {
    base: 'border-2 border-border-subtle text-text-primary',
    hover: '',
    magnetic: 'rgba(255, 90, 54, 0.1)',
  },
};

const sizeStyles = {
  sm: 'px-4 py-2 text-sm gap-1.5',
  md: 'px-6 py-3 text-base gap-2',
  lg: 'px-8 py-4 text-lg gap-2.5',
  xl: 'px-10 py-5 text-xl gap-3',
};

export default function MagneticButton({
  variant = 'primary',
  size = 'md',
  children,
  magneticStrength = 0.35,
  iconLeft,
  iconRight,
  fullWidth = false,
  loading = false,
  className = '',
  style,
  onClick,
  disabled,
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const springConfig = { stiffness: 300, damping: 25 };

  const rotateX = useSpring(useTransform(my, [-1, 1], [-8, 8]), springConfig);
  const rotateY = useSpring(useTransform(mx, [-1, 1], [8, -8]), springConfig);
  const scale = useSpring(useTransform(mx, [-1, 1], [1, 1.03]), { stiffness: 400, damping: 30 });

  const magneticGlowX = useTransform(mx, [-1, 1], [-30, 30]);
  const magneticGlowY = useTransform(my, [-1, 1], [-30, 30]);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mx.set(x * magneticStrength * 2);
    my.set(y * magneticStrength * 2);
  };

  const handleMouseLeave = () => {
    if (disabled || loading) return;
    mx.set(0);
    my.set(0);
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    if (disabled || loading) return;
    setIsHovered(true);
  };

  const handleMouseDown = () => {
    if (disabled || loading) return;
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const v = variantStyles[variant];
  const s = sizeStyles[size];

  const buttonContent = loading ? (
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" style={{ width: '1em', height: '1em' }}>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  ) : (
    children
  );

  const rightIcon = iconRight && !loading ? (
    <span style={{ display: 'flex' }}>{iconRight}</span>
  ) : null;

  const leftIcon = iconLeft ? (
    <span style={{ display: 'flex' }}>{iconLeft}</span>
  ) : null;

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={{ scale: 0.96 }}
      style={{
        rotateX: rotateX.get(),
        rotateY: rotateY.get(),
        scale: scale.get(),
        transformPerspective: 800,
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      } as React.CSSProperties}
      className={`relative inline-flex items-center justify-center font-semibold rounded-full transition-all duration-300 ${v.base} ${s} ${fullWidth ? 'w-full' : ''} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      {...Object.fromEntries(Object.entries(props).filter(([k]) => !k.startsWith('onAnimation')))}
    >
      <motion.div
        transition={{ duration: 300, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'absolute',
          inset: '-4px',
          borderRadius: 'inherit',
          background: v.magnetic,
          filter: 'blur(20px)',
          opacity: isHovered ? 0.6 : 0,
          zIndex: -1,
          x: magneticGlowX,
          y: magneticGlowY,
        }}
      />

      <motion.div
        initial={{ x: '-120%', opacity: 0 }}
        animate={{ x: isHovered ? '120%' : '-120%', opacity: isHovered ? 1 : 0 }}
        transition={{ duration: isHovered ? 600 : 0, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
          pointerEvents: 'none',
        }}
      />

      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'inherit', position: 'relative', zIndex: 1 }}>
        {leftIcon}
        {buttonContent}
        {rightIcon}
      </span>

      <motion.span
        initial={{ scale: 0, opacity: 0.4 }}
        animate={isPressed ? { scale: 2.5, opacity: 0 } : { scale: 0, opacity: 0 }}
        transition={{ duration: 400, ease: [0, 0, 0.2, 1] }}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          background: 'currentColor',
          pointerEvents: 'none',
        }}
      />
    </motion.button>
  );
}