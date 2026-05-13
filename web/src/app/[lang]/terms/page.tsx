import Link from "next/link"

export default async function TermsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const isBg = lang === "bg"

  return (
    <div className="min-h-screen bg-[#020617] px-6 py-24 md:px-16 lg:px-32">
      <Link
        href={`/${lang}`}
        className="mb-10 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#B87333] transition-colors hover:text-white"
      >
        ← {isBg ? "Назад" : "Back"}
      </Link>
      <h1 className="mb-6 text-3xl font-black text-white md:text-4xl">
        {isBg ? "Условия за ползване" : "Terms of Use"}
      </h1>
      <p className="text-sm leading-relaxed text-slate-500">
        {isBg
          ? "Страницата е в процес на изготвяне."
          : "This page is currently being prepared."}
      </p>
    </div>
  )
}
