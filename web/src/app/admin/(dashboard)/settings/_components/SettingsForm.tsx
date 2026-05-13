"use client"

import { useActionState } from "react"
import type { SettingsFormState } from "../actions"
import type { saveSettings } from "../actions"

type Action = typeof saveSettings

type SettingsFormInitial = {
  companyName?: string
  logoUrl?: string | null
  address?: string | null
  phones?: string[]
  email?: string | null
  workingHours?: string | null
  googleMapsEmbed?: string | null
  socialLinks?: unknown
  footerText?: string | null
  defaultSeoTitle?: string | null
  defaultSeoDescription?: string | null
}

type Props = {
  action: Action
  initial?: SettingsFormInitial
}

const inputCls =
  "w-full rounded-lg border border-white/[0.10] bg-white/[0.04] px-3 py-2.5 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-[#B87333]/50 focus:ring-1 focus:ring-[#B87333]/20"

const labelCls = "flex flex-col gap-1.5 text-sm font-medium text-slate-300"

const sectionTitle = "mb-4 text-[10px] font-semibold uppercase tracking-widest text-slate-600"

export function SettingsForm({ action, initial = {} }: Props) {
  const [state, formAction, pending] = useActionState<SettingsFormState, FormData>(action, {})

  const phonesDefault = (initial.phones ?? []).join("\n")
  const socialLinksDefault =
    initial.socialLinks != null ? JSON.stringify(initial.socialLinks, null, 2) : ""

  return (
    <form action={formAction} className="flex flex-col gap-8">

      {/* Company Info */}
      <section>
        <p className={sectionTitle}>Company Info</p>
        <div className="flex flex-col gap-5">
          <div className="flex gap-4">
            <label className={`${labelCls} flex-1`}>
              Company Name <span className="font-normal text-red-400">*</span>
              <input
                name="companyName"
                type="text"
                defaultValue={initial.companyName ?? ""}
                className={inputCls}
              />
              {state.errors?.companyName && (
                <span className="text-xs text-red-400">{state.errors.companyName}</span>
              )}
            </label>

            <label className={`${labelCls} flex-1`}>
              Logo URL
              <input
                name="logoUrl"
                type="text"
                defaultValue={initial.logoUrl ?? ""}
                placeholder="https://..."
                className={inputCls}
              />
            </label>
          </div>

          <label className={labelCls}>
            Address
            <input
              name="address"
              type="text"
              defaultValue={initial.address ?? ""}
              className={inputCls}
            />
          </label>

          <div className="flex gap-4">
            <label className={`${labelCls} flex-1`}>
              Email
              <input
                name="email"
                type="text"
                defaultValue={initial.email ?? ""}
                className={inputCls}
              />
            </label>

            <label className={`${labelCls} flex-1`}>
              Working Hours
              <input
                name="workingHours"
                type="text"
                defaultValue={initial.workingHours ?? ""}
                placeholder="Mon–Fri 09:00–18:00"
                className={inputCls}
              />
            </label>
          </div>

          <label className={labelCls}>
            Phone Numbers
            <span className="text-xs font-normal text-slate-600">One per line</span>
            <textarea
              name="phones"
              rows={3}
              defaultValue={phonesDefault}
              placeholder="+359 88 123 4567"
              className={`${inputCls} resize-y`}
            />
          </label>
        </div>
      </section>

      {/* Map */}
      <section className="border-t border-white/[0.06] pt-6">
        <p className={sectionTitle}>Map & Location</p>
        <label className={labelCls}>
          Google Maps Embed URL
          <input
            name="googleMapsEmbed"
            type="text"
            defaultValue={initial.googleMapsEmbed ?? ""}
            placeholder="https://www.google.com/maps/embed?pb=..."
            className={inputCls}
          />
        </label>
      </section>

      {/* Social */}
      <section className="border-t border-white/[0.06] pt-6">
        <p className={sectionTitle}>Social & Links</p>
        <label className={labelCls}>
          Social Links
          <span className="text-xs font-normal text-slate-600">
            JSON — e.g. {`{"facebook":"https://...","instagram":"https://..."}`}
          </span>
          <textarea
            name="socialLinks"
            rows={4}
            defaultValue={socialLinksDefault}
            className={`${inputCls} resize-y font-mono text-xs`}
          />
          {state.errors?.socialLinks && (
            <span className="text-xs text-red-400">{state.errors.socialLinks}</span>
          )}
        </label>
      </section>

      {/* Footer */}
      <section className="border-t border-white/[0.06] pt-6">
        <p className={sectionTitle}>Footer</p>
        <label className={labelCls}>
          Footer Text
          <input
            name="footerText"
            type="text"
            defaultValue={initial.footerText ?? ""}
            className={inputCls}
          />
        </label>
      </section>

      {/* SEO Defaults */}
      <section className="border-t border-white/[0.06] pt-6">
        <p className={sectionTitle}>SEO Defaults</p>
        <div className="flex flex-col gap-5">
          <label className={labelCls}>
            Default SEO Title
            <input
              name="defaultSeoTitle"
              type="text"
              defaultValue={initial.defaultSeoTitle ?? ""}
              className={inputCls}
            />
          </label>

          <label className={labelCls}>
            Default SEO Description
            <textarea
              name="defaultSeoDescription"
              rows={3}
              defaultValue={initial.defaultSeoDescription ?? ""}
              className={`${inputCls} resize-y`}
            />
          </label>
        </div>
      </section>

      <div className="border-t border-white/[0.06] pt-5">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[#B87333] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#c8833a] disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save Settings"}
        </button>
      </div>
    </form>
  )
}
