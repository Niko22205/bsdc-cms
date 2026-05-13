"use client"

import { useState } from "react"
import Image from "next/image"
import { Modal } from "@/app/_components/Modal"

export type CertificateItem = {
  id: string
  title: string
  issuer: string | null
  issueDate: string | null
  imageUrl: string | null
  fileUrl: string | null
  description: string | null
}

export function CertificateCard({ certificate: c }: { certificate: CertificateItem }) {
  const [open, setOpen] = useState(false)
  const hasModal = !!(c.imageUrl || c.description)

  return (
    <>
      <div
        className={`rounded-xl border border-zinc-200 bg-white p-5 shadow-sm${hasModal ? " cursor-pointer hover:border-zinc-300" : ""}`}
        onClick={hasModal ? () => setOpen(true) : undefined}
        role={hasModal ? "button" : undefined}
        tabIndex={hasModal ? 0 : undefined}
        onKeyDown={
          hasModal
            ? (e) => { if (e.key === "Enter" || e.key === " ") setOpen(true) }
            : undefined
        }
      >
        {c.imageUrl && (
          <div className="mb-4 overflow-hidden rounded">
            <Image
              src={c.imageUrl}
              alt={c.title}
              width={320}
              height={200}
              unoptimized
              className="h-40 w-full object-cover"
            />
          </div>
        )}
        <h3 className="text-sm font-semibold text-zinc-900">{c.title}</h3>
        {c.issuer && <p className="mt-1 text-xs text-zinc-500">{c.issuer}</p>}
        {c.issueDate && <p className="mt-0.5 text-xs text-zinc-400">{c.issueDate}</p>}
        {c.fileUrl && !hasModal && (
          <a
            href={c.fileUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="mt-3 inline-block text-xs font-medium text-zinc-700 underline hover:text-zinc-900"
          >
            Виж сертификат
          </a>
        )}
        {hasModal && (
          <span className="mt-3 inline-block text-xs font-medium text-zinc-500 underline">
            Виж детайли
          </span>
        )}
      </div>

      {hasModal && (
        <Modal open={open} onClose={() => setOpen(false)}>
          {c.imageUrl && (
            <div className="relative bg-zinc-100">
              <Image
                src={c.imageUrl}
                alt={c.title}
                width={800}
                height={500}
                unoptimized
                className="max-h-[50vh] w-full object-contain"
              />
              <button
                onClick={() => setOpen(false)}
                aria-label="Затвори"
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
              >
                ×
              </button>
            </div>
          )}
          <div className="p-6">
            {!c.imageUrl && (
              <div className="mb-4 flex justify-end">
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Затвори"
                  className="text-zinc-400 hover:text-zinc-900"
                >
                  ×
                </button>
              </div>
            )}
            <h2 className="text-xl font-bold text-zinc-900">{c.title}</h2>
            {c.issuer && <p className="mt-1 text-sm text-zinc-500">{c.issuer}</p>}
            {c.issueDate && <p className="mt-0.5 text-xs text-zinc-400">{c.issueDate}</p>}
            {c.description && (
              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-zinc-600">
                {c.description}
              </p>
            )}
            {c.fileUrl && (
              <a
                href={c.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-block rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
              >
                Виж сертификат
              </a>
            )}
          </div>
        </Modal>
      )}
    </>
  )
}
