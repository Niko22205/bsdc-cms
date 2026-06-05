"use client"

import React from "react"
import { MapPin, Phone, Mail, Clock } from "lucide-react"
import type { Service, Partner, SiteSetting } from "@/generated/prisma/client"

type ContactStatus = "idle" | "loading" | "success" | "error"

interface SceneContactProps {
  contactRef:     React.RefObject<HTMLDivElement | null>
  settings:       SiteSetting | null
  services:       Service[]
  partners:       Partner[]
  tickerPartners: Partner[]
  contactStatus:  ContactStatus
  lang:           string
  goToScene:      (n: number) => void
  submitContact:  (e: React.FormEvent<HTMLFormElement>) => void
}

export const SceneContact = ({
  contactRef, settings, services, partners, tickerPartners,
  contactStatus, lang, goToScene, submitContact,
}: SceneContactProps) => {
  return (
    <div ref={contactRef} className="absolute inset-0" style={{ willChange: "opacity, transform" }}>

      {/* Map as full-height dark background */}
      {settings?.googleMapsEmbed && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {settings.googleMapsEmbed.trim().startsWith("<iframe") ? (
            <div
              className="h-full w-full [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:border-0"
              style={{ filter: "invert(90%) hue-rotate(180deg) brightness(0.35)" }}
              dangerouslySetInnerHTML={{ __html: settings.googleMapsEmbed }}
            />
          ) : (
            <iframe
              src={settings.googleMapsEmbed}
              className="h-full w-full border-0"
              style={{ filter: "invert(90%) hue-rotate(180deg) brightness(0.35)" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Map"
            />
          )}
        </div>
      )}

      <div className="absolute inset-0 z-[2] flex flex-col">

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">

          {/* Left: company info */}
          <div className="contact-info flex w-full flex-col justify-center bg-[#8A9A86]/95 px-8 py-10 md:w-2/5 md:px-12">
            <h2 className="mb-8 text-3xl font-light leading-tight text-[#1A221E] md:text-4xl">
              {settings?.companyName ?? "BSDC"}
            </h2>
            <div className="flex flex-col gap-5">
              {settings?.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#4A5343]" />
                  <span className="text-base leading-relaxed text-[#1A221E]/75">{settings.address}</span>
                </div>
              )}
              {settings?.phones && settings.phones.length > 0 && (
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#4A5343]" />
                  <div className="flex flex-col gap-1">
                    {settings.phones.map((p, i) => (
                      <a
                        key={i}
                        href={`tel:${p.replace(/\s/g, "")}`}
                        className="text-base text-[#1A221E]/75 transition-colors hover:text-[#1A221E]"
                      >
                        {p}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {settings?.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 flex-shrink-0 text-[#4A5343]" />
                  <a
                    href={`mailto:${settings.email}`}
                    className="text-base text-[#1A221E]/75 transition-colors hover:text-[#1A221E]"
                  >
                    {settings.email}
                  </a>
                </div>
              )}
              {settings?.workingHours && (
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 flex-shrink-0 text-[#4A5343]" />
                  <span className="text-base text-[#1A221E]/75">{settings.workingHours}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: contact form */}
          <div className="contact-form flex flex-1 flex-col justify-center bg-[#8A9A86]/95 px-8 py-10 md:px-12">
            <h3 className="mb-6 text-xl font-light text-[#1A221E]">
              {lang === "bg" ? "Изпратете запитване" : "Send an Enquiry"}
            </h3>
            <form onSubmit={submitContact} className="flex flex-col gap-4">
              {/* Honeypot */}
              <input name="website" type="text" className="hidden" tabIndex={-1} autoComplete="off" />

              <div className="grid grid-cols-2 gap-4">
                <input
                  name="name"
                  type="text"
                  required
                  placeholder={lang === "bg" ? "Вашето име" : "Your name"}
                  className="border-0 border-b border-[#1A221E]/20 bg-transparent px-0 py-3 text-sm text-[#1A221E] placeholder-[#1A221E]/40 outline-none transition-colors focus:border-b focus:border-[#1A221E]/40"
                />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder={lang === "bg" ? "Имейл" : "Email"}
                  className="border-0 border-b border-[#1A221E]/20 bg-transparent px-0 py-3 text-sm text-[#1A221E] placeholder-[#1A221E]/40 outline-none transition-colors focus:border-b focus:border-[#1A221E]/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  name="phone"
                  type="tel"
                  placeholder={lang === "bg" ? "Телефон" : "Phone"}
                  className="border-0 border-b border-[#1A221E]/20 bg-transparent px-0 py-3 text-sm text-[#1A221E] placeholder-[#1A221E]/40 outline-none transition-colors focus:border-b focus:border-[#1A221E]/40"
                />
                <select
                  name="type"
                  className="border-0 border-b border-[#1A221E]/20 bg-transparent px-0 py-3 text-sm text-[#1A221E]/75 outline-none transition-colors focus:border-b focus:border-[#1A221E]/40"
                >
                  <option value="">{lang === "bg" ? "Вид запитване" : "Enquiry type"}</option>
                  <option value="general">{lang === "bg" ? "Обща информация" : "General"}</option>
                  <option value="services">{lang === "bg" ? "Услуги" : "Services"}</option>
                  <option value="project">{lang === "bg" ? "Проект" : "Project"}</option>
                </select>
              </div>

              <textarea
                name="message"
                required
                rows={4}
                placeholder={lang === "bg" ? "Вашето съобщение..." : "Your message..."}
                className="resize-none border-0 border-b border-[#1A221E]/20 bg-transparent px-0 py-3 text-sm text-[#1A221E] placeholder-[#1A221E]/40 outline-none transition-colors focus:border-b focus:border-[#1A221E]/40"
              />

              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={contactStatus === "loading"}
                  className="self-start bg-[#4A5343] px-8 py-4 text-[11px] uppercase tracking-[0.2em] text-[#1A221E] transition-colors hover:bg-[#242F2A] disabled:opacity-60"
                >
                  {contactStatus === "loading"
                    ? (lang === "bg" ? "Изпращане..." : "Sending...")
                    : (lang === "bg" ? "Изпрати" : "Send")}
                </button>

                {contactStatus === "success" && (
                  <p className="text-sm text-emerald-400">
                    {lang === "bg" ? "Съобщението е изпратено!" : "Message sent successfully!"}
                  </p>
                )}
                {contactStatus === "error" && (
                  <p className="text-sm text-red-400">
                    {lang === "bg" ? "Грешка. Опитайте отново." : "Error. Please try again."}
                  </p>
                )}
              </div>
            </form>
          </div>

        </div>


        {/* Partners ticker */}
        {partners.length > 0 && (
          <div className="overflow-hidden border-t border-[#1A221E]/[0.12] bg-[#8A9A86]/80 py-4">
            <div className="flex animate-bsdc-ticker gap-16 whitespace-nowrap">
              {tickerPartners.map((p, i) => (
                <div key={`${p.id}-${i}`} className="flex h-8 flex-shrink-0 items-center">
                  <img
                    src={p.logoUrl}
                    alt={p.name}
                    className="h-full w-auto object-contain opacity-50 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="border-t border-[#1A221E]/[0.12] bg-[#8A9A86] px-6 py-5 md:px-16">
          <div className="grid grid-cols-2 gap-x-4 gap-y-5 md:grid-cols-4">
            {/* Brand */}
            <div className="text-center">
              <img src="/uploads/bsdc/logo-white.png" alt="BSDC" className="mx-auto mb-3 block h-20 w-auto object-contain" style={{ filter: "brightness(0) saturate(0) opacity(0.6)" }} />
              <p className="max-w-[200px] text-sm leading-relaxed text-[#1A221E]/55">
                {lang === "bg" ? (
                  <>Подводни технологии и<br />хидротехническо инженерство от 2001 г.</>
                ) : (
                  <>Underwater technologies and<br />hydrotechnical engineering since 2001.</>
                )}
              </p>
            </div>
            {/* Navigation */}
            <div>
              <p className="mb-2 text-sm font-light uppercase tracking-[0.2em] text-[#1A221E]/75">
                {lang === "bg" ? "Навигация" : "Navigation"}
              </p>
              <nav className="flex flex-col gap-1">
                {([
                  [0, lang === "bg" ? "Начало"   : "Home"],
                  [1, lang === "bg" ? "За нас"   : "About"],
                  [2, lang === "bg" ? "Услуги"   : "Services"],
                  [3, lang === "bg" ? "Проекти"  : "Projects"],
                  [4, lang === "bg" ? "Контакти" : "Contact"],
                ] as [number, string][]).map(([scene, label]) => (
                  <button
                    key={scene}
                    type="button"
                    onClick={() => goToScene(scene)}
                    className="text-left text-sm text-[#1A221E]/55 transition-colors hover:text-[#1A221E]/90"
                  >
                    {label}
                  </button>
                ))}
              </nav>
            </div>
            {/* Services */}
            <div>
              <p className="mb-2 text-sm font-light uppercase tracking-[0.2em] text-[#1A221E]/75">
                {lang === "bg" ? "Услуги" : "Services"}
              </p>
              <div className="flex flex-col gap-1">
                {services.slice(0, 6).map((svc) => (
                  <span key={svc.id} className="text-sm leading-tight text-[#1A221E]/55">{svc.title}</span>
                ))}
              </div>
            </div>
            {/* Contact + Legal */}
            <div>
              <p className="mb-2 text-sm font-light uppercase tracking-[0.2em] text-[#1A221E]/75">
                {lang === "bg" ? "Контакти и правно" : "Contact & Legal"}
              </p>
              <div className="mb-3 flex flex-col gap-1">
                {settings?.email && (
                  <a href={`mailto:${settings.email}`} className="text-sm text-[#1A221E]/55 transition-colors hover:text-[#1A221E]/90">
                    {settings.email}
                  </a>
                )}
                {settings?.phones?.[0] && (
                  <a href={`tel:${settings.phones[0].replace(/\s/g, "")}`} className="text-sm text-[#1A221E]/55 transition-colors hover:text-[#1A221E]/90">
                    {settings.phones[0]}
                  </a>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <a href={`/${lang}/privacy`} className="text-sm text-[#1A221E]/55 transition-colors hover:text-[#1A221E]/75">
                  {lang === "bg" ? "Политика за поверителност" : "Privacy Policy"}
                </a>
                <a href={`/${lang}/cookies`} className="text-sm text-[#1A221E]/55 transition-colors hover:text-[#1A221E]/75">
                  {lang === "bg" ? "Политика за бисквитки" : "Cookie Policy"}
                </a>
                <a href={`/${lang}/terms`} className="text-sm text-[#1A221E]/55 transition-colors hover:text-[#1A221E]/75">
                  {lang === "bg" ? "Условия за ползване" : "Terms of Use"}
                </a>
              </div>
            </div>
          </div>
          <div className="mt-4 border-t border-[#1A221E]/[0.08] pt-3 text-center">
            <p className="text-sm text-[#1A221E]/55">
              {`© ${new Date().getFullYear()} ${settings?.companyName ?? "Черноморски Водолазен Център ООД"}. ${lang === "bg" ? "Всички права запазени." : "All rights reserved."}`}
            </p>
          </div>
        </footer>

      </div>
    </div>
  )
}
