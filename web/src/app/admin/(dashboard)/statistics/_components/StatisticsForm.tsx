"use client"

import { useActionState, useState } from "react"
import type { saveStatistics, StatisticsFormState, StatItem } from "../actions"

type Action = typeof saveStatistics

type Props = {
  action: Action
  initialHero:  StatItem[]
  initialAbout: StatItem[]
}

const inputCls =
  "w-full rounded-lg border border-white/[0.10] bg-white/[0.04] px-3 py-2.5 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-[#B87333]/50 focus:ring-1 focus:ring-[#B87333]/20"

const labelCls = "text-xs font-medium text-slate-400"

function StatSection({
  title,
  description,
  items,
  onChange,
  error,
  addLabel,
}: {
  title: string
  description: string
  items: StatItem[]
  onChange: (items: StatItem[]) => void
  error?: string
  addLabel: string
}) {
  function update(i: number, field: keyof StatItem, val: string) {
    onChange(items.map((item, idx) => (idx === i ? { ...item, [field]: val } : item)))
  }
  function remove(i: number) {
    onChange(items.filter((_, idx) => idx !== i))
  }
  function add() {
    onChange([...items, { value: "", label: "" }])
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] p-5">
      <div>
        <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </div>

      {items.length === 0 && (
        <p className="rounded-lg border border-dashed border-white/[0.08] py-4 text-center text-xs text-slate-600">
          Няма добавени статистики
        </p>
      )}

      <div className="flex flex-col gap-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2.5"
          >
            <div className="flex flex-1 items-center gap-3">
              <div className="flex flex-col gap-1">
                <span className={labelCls}>Стойност</span>
                <input
                  type="text"
                  value={item.value}
                  onChange={(e) => update(i, "value", e.target.value)}
                  placeholder="напр. 2001"
                  className="w-24 rounded-md border border-white/[0.10] bg-white/[0.04] px-2.5 py-1.5 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-[#B87333]/50"
                />
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <span className={labelCls}>Етикет</span>
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => update(i, "label", e.target.value)}
                  placeholder="напр. Основана"
                  className={inputCls}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => remove(i)}
              className="flex-shrink-0 self-end pb-1.5 text-xs text-red-400 transition hover:text-red-300"
            >
              Премахни
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={add}
        className="self-start rounded-lg border border-dashed border-[#B87333]/40 px-4 py-2 text-xs text-[#B87333] transition hover:border-[#B87333]/70 hover:bg-[#B87333]/[0.06]"
      >
        {addLabel}
      </button>
    </div>
  )
}

export function StatisticsForm({ action, initialHero, initialAbout }: Props) {
  const [state, formAction, pending] = useActionState<StatisticsFormState, FormData>(
    action,
    {},
  )

  const [heroItems,  setHeroItems]  = useState<StatItem[]>(initialHero)
  const [aboutItems, setAboutItems] = useState<StatItem[]>(initialAbout)

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="heroStats"  value={JSON.stringify(heroItems)} />
      <input type="hidden" name="aboutStats" value={JSON.stringify(aboutItems)} />

      <StatSection
        title="Начална страница — Hero"
        description="Статистиките показани в долната лента на Hero сцената (препоръчително 3 броя)."
        items={heroItems}
        onChange={setHeroItems}
        error={state.errors?.heroStats}
        addLabel="+ Добави Hero статистика"
      />

      <StatSection
        title="За нас — About"
        description="Статистиките показани в About секцията (препоръчително 3 броя)."
        items={aboutItems}
        onChange={setAboutItems}
        error={state.errors?.aboutStats}
        addLabel="+ Добави About статистика"
      />

      <div className="border-t border-white/[0.06] pt-5">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[#B87333] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#c8833a] disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save Statistics"}
        </button>
      </div>
    </form>
  )
}
