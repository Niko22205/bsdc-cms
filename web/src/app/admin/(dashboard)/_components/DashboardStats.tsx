"use client"

import { motion } from "framer-motion"
import { MessageSquare, Briefcase, FolderOpen, ImageIcon, type LucideIcon } from "lucide-react"

type StatItem = {
  label: string
  value: number
  description: string
  Icon: LucideIcon
}

type Props = {
  unread: number
  services: number
  projects: number
  media: number
}

export function DashboardStats({ unread, services, projects, media }: Props) {
  const stats: StatItem[] = [
    {
      label: "Unread Messages",
      value: unread,
      description: "Contact form inquiries",
      Icon: MessageSquare,
    },
    {
      label: "Active Services",
      value: services,
      description: "Published service listings",
      Icon: Briefcase,
    },
    {
      label: "Project Fleet",
      value: projects,
      description: "Total projects & news",
      Icon: FolderOpen,
    },
    {
      label: "Media Library",
      value: media,
      description: "Files registered",
      Icon: ImageIcon,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map(({ label, value, description, Icon }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.04] p-6 backdrop-blur-md"
        >
          {/* Copper glow line at top */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#B87333]/55 to-transparent" />

          {/* Icon badge */}
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#B87333]/[0.13]">
            <Icon size={22} color="#B87333" />
          </div>

          {/* Value */}
          <p className="text-[2.6rem] font-bold leading-none tabular-nums text-white">
            {value}
          </p>

          {/* Labels */}
          <p className="mt-2 text-sm font-semibold text-slate-300">{label}</p>
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        </motion.div>
      ))}
    </div>
  )
}
