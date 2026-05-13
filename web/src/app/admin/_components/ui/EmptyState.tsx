import Link from "next/link"

type Props = {
  title: string
  description?: string
  action?: {
    label: string
    href: string
  }
}

export function EmptyState({ title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.10] bg-white/[0.03] px-6 py-16 text-center">
      <svg
        className="mb-4 h-10 w-10 text-slate-700"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
        />
      </svg>
      <p className="text-sm font-semibold text-slate-300">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      )}
      {action && (
        <Link
          href={action.href}
          className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-[#B87333] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#c8833a] focus:outline-none"
        >
          <span aria-hidden="true">+</span>
          {action.label}
        </Link>
      )}
    </div>
  )
}
