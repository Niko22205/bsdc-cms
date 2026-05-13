"use client"

import { useActionState } from "react"
import { submitContact } from "@/app/_actions/submitContact"
import type { Lang } from "@/app/[lang]/page"

type Props = {
  lang: Lang
}

const INQUIRY_TYPES = [
  "Водолазни услуги",
  "ROV услуги",
  "Ремонти на пристанища и съдове",
  "Батиметрия и хидрография",
  "Водолазни курсове",
  "Друго",
]

const inputCls =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/30 transition"

export function ContactForm({ lang }: Props) {
  const [state, action, pending] = useActionState(submitContact, {})

  if (state.success) {
    return (
      <div className="rounded-xl border border-sky-500/20 bg-sky-900/20 p-8 text-center">
        <p className="text-base font-semibold text-sky-300">
          Вашето съобщение е изпратено успешно!
        </p>
        <p className="mt-2 text-sm text-slate-400">
          Ще се свържем с вас при първа възможност.
        </p>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="source" value={lang} />

      <div>
        <label htmlFor="cf-name" className="mb-1.5 block text-sm font-medium text-slate-300">
          Иme <span aria-hidden="true" className="text-red-400">*</span>
        </label>
        <input
          id="cf-name"
          name="name"
          type="text"
          autoComplete="name"
          className={inputCls}
          placeholder="Вашето иme"
        />
        {state.errors?.name && (
          <p role="alert" className="mt-1 text-xs text-red-400">
            {state.errors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="cf-email" className="mb-1.5 block text-sm font-medium text-slate-300">
          Имейл <span aria-hidden="true" className="text-red-400">*</span>
        </label>
        <input
          id="cf-email"
          name="email"
          type="email"
          autoComplete="email"
          className={inputCls}
          placeholder="email@example.com"
        />
        {state.errors?.email && (
          <p role="alert" className="mt-1 text-xs text-red-400">
            {state.errors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="cf-phone" className="mb-1.5 block text-sm font-medium text-slate-300">
          Телефон
        </label>
        <input
          id="cf-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          className={inputCls}
          placeholder="+359 ..."
        />
      </div>

      <div>
        <label htmlFor="cf-inquiry" className="mb-1.5 block text-sm font-medium text-slate-300">
          Вид запитване
        </label>
        <select id="cf-inquiry" name="inquiryType" className={inputCls}>
          <option value="" className="bg-[#0d1f33]">
            — Изберете —
          </option>
          {INQUIRY_TYPES.map((t) => (
            <option key={t} value={t} className="bg-[#0d1f33]">
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="cf-message" className="mb-1.5 block text-sm font-medium text-slate-300">
          Съобщение <span aria-hidden="true" className="text-red-400">*</span>
        </label>
        <textarea
          id="cf-message"
          name="message"
          rows={5}
          className={inputCls}
          placeholder="Опишете вашето запитване…"
        />
        {state.errors?.message && (
          <p role="alert" className="mt-1 text-xs text-red-400">
            {state.errors.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-900/30 transition hover:bg-sky-500 disabled:opacity-60"
      >
        {pending ? "Изпращане…" : "Изпрати съобщение"}
      </button>
    </form>
  )
}
