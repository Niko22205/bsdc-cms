const modules = [
  { label: "Home Section", href: "/admin/home", description: "Hero, tagline, and intro content" },
  { label: "About", href: "/admin/about", description: "Company story and team members" },
  { label: "Services", href: "/admin/services", description: "Service listings and descriptions" },
  { label: "Projects / News", href: "/admin/projects", description: "Portfolio projects and news posts" },
  { label: "Partners", href: "/admin/partners", description: "Partner logos and links" },
  { label: "Certificates", href: "/admin/certificates", description: "Certifications and accreditations" },
  { label: "Media", href: "/admin/media", description: "Images, videos, and documents" },
  { label: "Submissions", href: "/admin/submissions", description: "Contact form messages" },
  { label: "Settings", href: "/admin/settings", description: "Site-wide configuration" },
]

export default function DashboardPage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-zinc-900">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map(({ label, href, description }) => (
          <a
            key={href}
            href={href}
            className="rounded-lg border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-sm"
          >
            <p className="font-medium text-zinc-900">{label}</p>
            <p className="mt-1 text-sm text-zinc-500">{description}</p>
          </a>
        ))}
      </div>
    </div>
  )
}
