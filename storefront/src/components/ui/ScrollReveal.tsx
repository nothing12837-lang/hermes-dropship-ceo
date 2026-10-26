'use client'

import { useEffect, useRef } from 'react'

interface ScrollRevealProps {
  children: React.ReactNode
  delay?: number
}

export function ScrollReveal({ children, delay = 0 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Immediate check for above-the-fold elements to prevent blank left-side cards
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight + 100) {
      el.classList.add('in-view')
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('in-view')
          observer.disconnect()
        }
      },
      { threshold: 0.05, rootMargin: '120px 0px 120px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className="scroll-reveal"
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
