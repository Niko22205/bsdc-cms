import Link from "next/link"

type Props = {
  title: string
  description?: string
  action?: {
    label: string
    href: string
  }
}

export function PageHeader({ title, description, action }: Props) {
  return (
    <div className="mb-8 flex items-start justify-between gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#B87333] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#c8833a] focus:outline-none"
        >
          <span aria-hidden="true">+</span>
          {action.label}
        </Link>
      )}
    </div>
  )
}
