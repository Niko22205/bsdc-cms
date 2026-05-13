type Variant = "green" | "zinc" | "indigo" | "amber" | "blue" | "red"

const variantCls: Record<Variant, string> = {
  green:  "bg-emerald-400/[0.12] text-emerald-400 ring-emerald-400/20",
  zinc:   "bg-white/[0.08] text-slate-400 ring-white/[0.10]",
  indigo: "bg-indigo-400/[0.12] text-indigo-400 ring-indigo-400/20",
  amber:  "bg-amber-400/[0.12] text-amber-400 ring-amber-400/20",
  blue:   "bg-blue-400/[0.12] text-blue-400 ring-blue-400/20",
  red:    "bg-red-400/[0.12] text-red-400 ring-red-400/20",
}

type Props = {
  variant: Variant
  children: React.ReactNode
}

export function Badge({ variant, children }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${variantCls[variant]}`}
    >
      {children}
    </span>
  )
}
