"use client"

import { useEffect, useRef, type ReactNode } from "react"

type Props = {
  children: ReactNode
  delay?: 1 | 2 | 3 | 4
  className?: string
}

export function ScrollReveal({ children, delay, className }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("bsdc-in-view")
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const classes = ["bsdc-reveal"]
  if (delay) classes.push(`bsdc-rd${delay}`)
  if (className) classes.push(className)

  return (
    <div ref={ref} className={classes.join(" ")}>
      {children}
    </div>
  )
}
