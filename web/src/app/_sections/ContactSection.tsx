import type { SiteSetting } from "@/generated/prisma/client"
import type { Lang } from "../[lang]/page"
import { ContactForm } from "./_components/ContactForm"
import { ScrollReveal } from "@/app/_components/ScrollReveal"

type Props = {
  settings: SiteSetting | null
  lang: Lang
}

export function ContactSection({ settings, lang }: Props) {
  return (
    <section id="contact" className="scroll-mt-20 bg-[#07111f] px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <ScrollReveal>
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-sky-500">
                  Контакти
                </p>
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Свържете се с нас
                </h2>
                <p className="mt-4 text-base leading-relaxed text-slate-400">
                  Свържете се с нас за оферта, консултация или въпрос.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={2}>
              <div className="mt-8 space-y-4 text-sm">
                {settings?.address && (
                  <div className="flex items-start gap-3">
                    <svg
                      className="mt-0.5 h-4 w-4 shrink-0 text-sky-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                      />
                    </svg>
                    <span className="text-slate-300">{settings.address}</span>
                  </div>
                )}
                {settings?.phones?.map((phone, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <svg
                      className="h-4 w-4 shrink-0 text-sky-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 6.75z"
                      />
                    </svg>
                    <a
                      href={`tel:${phone}`}
                      className="text-slate-300 transition hover:text-white"
                    >
                      {phone}
                    </a>
                  </div>
                ))}
                {settings?.email && (
                  <div className="flex items-center gap-3">
                    <svg
                      className="h-4 w-4 shrink-0 text-sky-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                      />
                    </svg>
                    <a
                      href={`mailto:${settings.email}`}
                      className="text-slate-300 transition hover:text-white"
                    >
                      {settings.email}
                    </a>
                  </div>
                )}
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={2}>
            <ContactForm lang={lang} />
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
