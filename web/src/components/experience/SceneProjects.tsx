"use client"

import React from "react"
import { motion, useTransform, type MotionValue } from "framer-motion"
import type { ProjectNewsItem } from "@/generated/prisma/client"

// ── 3D Cylindrical card ───────────────────────────────────────────────────────

interface ProjectCard3DProps {
  project:        ProjectNewsItem
  index:          number
  totalItems:     number
  activeProgress: MotionValue<number>
  onCardClick:    (index: number) => void
}

function ProjectCard3D({ project, index, totalItems, activeProgress, onCardClick }: ProjectCard3DProps) {
  const DEGREES_PER_CARD = 20.5
  const RADIUS           = -1100

  function wrappedDistance(latest: number): number {
    if (totalItems === 0) return 0
    let d = index - latest
    const half = totalItems / 2
    while (d >  half) d -= totalItems
    while (d <= -half) d += totalItems
    return d
  }

  const transformStr = useTransform(activeProgress, (latest) => {
    if (totalItems === 0) return `rotateY(0deg) translateZ(${RADIUS}px)`
    const d = wrappedDistance(latest)
    return `rotateY(${d * DEGREES_PER_CARD}deg) translateZ(${RADIUS}px)`
  })

  const zIndexVal = useTransform(activeProgress, (latest) =>
    Math.round(1000 - Math.abs(wrappedDistance(latest)) * 100)
  )

  const opacityVal = useTransform(activeProgress, (latest) => {
    const absDist = Math.abs(wrappedDistance(latest))
    if (absDist > 4.6) return 0
    if (absDist > 3.8) return 1 - (absDist - 3.8)
    return 1
  })

  const overlayOpacity = useTransform(activeProgress, (latest) => {
    if (totalItems === 0) return 0
    let d = index - latest
    const half = totalItems / 2
    while (d >  half) d -= totalItems
    while (d <= -half) d += totalItems
    return Math.min(0.35, Math.abs(d) * 0.08)
  })

  return (
    <motion.div
      onClick={() => onCardClick(index)}
      style={{
        position:           "absolute",
        left:               "50%",
        top:                "54%",
        width:              "360px",
        height:             "510px",
        marginLeft:         "-180px",
        marginTop:          "-255px",
        transformStyle:     "preserve-3d",
        transform:          transformStr,
        zIndex:             zIndexVal,
        opacity:            opacityVal,
        backfaceVisibility: "hidden",
        borderRadius:       "20px",
        overflow:           "hidden",
        border:             "1px solid rgba(26,34,30,0.05)",
        boxShadow:          "0 25px 60px -15px rgba(0,0,0,0.9)",
        cursor:             "pointer",
        userSelect:         "none",
      }}
    >
      {/* Ambient depth overlay — centre card: 0% dark, edges: up to 35% */}
      <motion.div
        style={{
          position:       "absolute",
          inset:          0,
          zIndex:         10,
          pointerEvents:  "none",
          background:     "black",
          opacity:        overlayOpacity,
        }}
      />
      {project.featuredImageUrl ? (
        <img
          src={project.featuredImageUrl}
          alt={project.title}
          draggable={false}
          style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }}
        />
      ) : (
        <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#8A9A86,#4A5343)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 10, color: "rgba(26,34,30,0.25)", fontFamily: "monospace", letterSpacing: "0.1em" }}>
            {project.title}
          </span>
        </div>
      )}
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

interface SceneProjectsProps {
  projectsRef:          React.RefObject<HTMLDivElement | null>
  carouselContainerRef: React.RefObject<HTMLDivElement | null>
  filteredProjects:     ProjectNewsItem[]
  uniqueCategories:     string[]
  projActiveIndex:      number
  projectFilter:        "ALL" | "PROJECT" | "NEWS"
  categoryFilter:       string
  dragProgress:         MotionValue<number>
  activeProgress:       MotionValue<number>
  lang:                 string
  setProjectFilter:     (f: "ALL" | "PROJECT" | "NEWS") => void
  setCategoryFilter:    (c: string) => void
  setSelectedProject:   (p: ProjectNewsItem | null) => void
  handleCarouselPointerDown:  (e: React.PointerEvent<HTMLDivElement>) => void
  handleCarouselPointerMove:  (e: React.PointerEvent<HTMLDivElement>) => void
  handleCarouselPointerUp:    (e: React.PointerEvent<HTMLDivElement>) => void
  handleCarouselPointerLeave: () => void
}

export const SceneProjects = ({
  projectsRef, carouselContainerRef,
  filteredProjects, uniqueCategories, projActiveIndex,
  projectFilter, categoryFilter,
  dragProgress, activeProgress,
  lang,
  setProjectFilter, setCategoryFilter, setSelectedProject,
  handleCarouselPointerDown, handleCarouselPointerMove,
  handleCarouselPointerUp, handleCarouselPointerLeave,
}: SceneProjectsProps) => {
  return (
    <div
      ref={projectsRef}
      className="absolute inset-0 overflow-hidden select-none flex flex-col"
      style={{ willChange: "opacity, transform", background: "#8A9A86" }}
    >
      {/* Header */}
      <div className="arc-header shrink-0 pointer-events-none pt-24 pb-6 px-8 text-center z-10">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.35em] text-[#4A5343]">
          {lang === "bg" ? "ПОРТФОЛИО" : "PORTFOLIO"}
        </p>
        <h2 className="mb-3 text-4xl font-light leading-none tracking-tight text-[#1A221E] md:text-5xl">
          {lang === "bg" ? "Проекти & Новини" : "Projects & News"}
        </h2>
        <p className="mx-auto max-w-lg text-sm leading-relaxed text-[#1A221E]/40">
          {lang === "bg"
            ? "Реализирани обекти, инспекции и технически интервенции в подводни съоръжения"
            : "Completed structures, inspections, and technical interventions in underwater facilities"}
        </p>
      </div>

      {/* Filter buttons */}
      <div className="arc-header shrink-0 flex flex-wrap items-center justify-center gap-2 pb-4 px-4 z-10 pointer-events-auto">
        {(["ALL", "PROJECT", "NEWS"] as const).map(f => (
          <button
            key={f}
            type="button"
            onClick={() => setProjectFilter(f)}
            className="proj-filter-btn px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] transition-all duration-200 border"
            style={{
              borderColor: projectFilter === f ? "#4A5343" : "rgba(26,34,30,0.15)",
              color: projectFilter === f ? "#4A5343" : "rgba(26,34,30,0.45)",
              background: projectFilter === f ? "rgba(74,83,67,0.15)" : "transparent",
            }}
          >
            {f === "ALL" ? (lang === "bg" ? "Всички" : "All") : f === "PROJECT" ? (lang === "bg" ? "Проекти" : "Projects") : (lang === "bg" ? "Новини" : "News")}
          </button>
        ))}
        {uniqueCategories.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(categoryFilter === cat ? "ALL" : cat)}
            className="proj-filter-btn px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] transition-all duration-200 border"
            style={{
              borderColor: categoryFilter === cat ? "#4A5343" : "rgba(26,34,30,0.1)",
              color: categoryFilter === cat ? "#4A5343" : "rgba(26,34,30,0.35)",
              background: categoryFilter === cat ? "rgba(74,83,67,0.15)" : "transparent",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Active card typography — static, never moves */}
      <div className="arc-header shrink-0 h-36 flex flex-col items-center justify-center text-center px-4 z-30 pointer-events-none">
        {filteredProjects[projActiveIndex] && (
            <div className="flex flex-col items-center">
              {filteredProjects[projActiveIndex].category && (
                <span className="mb-1.5 inline-block px-2.5 py-0.5 text-[9px] tracking-widest uppercase text-[#4A5343] border border-[#4A5343]/30 bg-[#4A5343]/8">
                  {filteredProjects[projActiveIndex].category}
                </span>
              )}
              <h2 className="text-xl font-light tracking-tight text-[#1A221E] leading-tight max-w-3xl text-center md:text-2xl">
                {filteredProjects[projActiveIndex].title}
              </h2>
              {filteredProjects[projActiveIndex].excerpt && (
                <p className="mt-1 text-xs text-[#1A221E]/40 max-w-md line-clamp-2 leading-relaxed">
                  {filteredProjects[projActiveIndex].excerpt}
                </p>
              )}
              <button
                type="button"
                onClick={() => setSelectedProject(filteredProjects[projActiveIndex])}
                className="proj-modal-btn pointer-events-auto mt-2.5 text-[10px] uppercase tracking-[0.18em] text-[#4A5343] hover:text-[#1A221E] border-b border-[#4A5343]/25 hover:border-[#4A5343]/60 transition-all pb-0.5"
              >
                {lang === "bg" ? "Прочети повече →" : "Read more →"}
              </button>
            </div>
          )}
      </div>

      {/* Cylindrical IMAX carousel — pointer events on this container */}
      <div
        ref={carouselContainerRef}
        onPointerDown={handleCarouselPointerDown}
        onPointerMove={handleCarouselPointerMove}
        onPointerUp={handleCarouselPointerUp}
        onPointerLeave={handleCarouselPointerLeave}
        style={{
          flex: 1,
          minHeight: 0,
          position: "relative",
          perspective: "750px",
          transformStyle: "preserve-3d",
          cursor: "grab",
          overflow: "hidden",
          background: "#8A9A86",
        }}
      >
        {filteredProjects.length === 0 ? (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <p style={{ color: "rgba(26,34,30,0.35)", fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>
              {lang === "bg" ? "Няма резултати" : "No results"}
            </p>
          </div>
        ) : (
          filteredProjects.map((project, index) => (
            <ProjectCard3D
              key={`${project.id}-${index}`}
              project={project}
              index={index}
              totalItems={filteredProjects.length}
              activeProgress={activeProgress}
              onCardClick={(targetIndex) => {
                const current = dragProgress.get()
                const count   = filteredProjects.length
                const wrapped = ((Math.round(current) % count) + count) % count
                if (wrapped === targetIndex) {
                  setSelectedProject(project)
                } else {
                  dragProgress.set(targetIndex)
                }
              }}
            />
          ))
        )}
      </div>
    </div>
  )
}
