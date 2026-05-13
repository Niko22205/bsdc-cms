/**
 * WordPress media import script
 *
 * Downloads BSDC assets from the live WordPress site into public/uploads/bsdc/,
 * creates Media records for each, and updates CMS records with local paths.
 *
 * Safe to run multiple times — skips already-downloaded files and only creates
 * Media/Partner/Certificate records that do not yet exist.
 *
 * Run with:  npx tsx scripts/import-wp-media.ts
 */

import "dotenv/config"
import https from "https"
import http from "http"
import fs from "fs"
import fsp from "fs/promises"
import path from "path"
import { PrismaClient, ProjectNewsType } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const DEST = path.join(process.cwd(), "public", "uploads", "bsdc")

const downloaded: string[] = []
const alreadyExisted: string[] = []
const failed: string[] = []

// ─────────────────────────────────────────────────────────────────────────────
// Asset registry
// src  = canonical bsdc.bg URL
// local = safe lowercase hyphenated filename (no Cyrillic, no spaces)
// alt   = English alt text for Media record
// mime  = MIME type
// ─────────────────────────────────────────────────────────────────────────────

type Mime = "image/jpeg" | "image/png"

type Asset = {
  src: string
  local: string
  alt: string
  mime: Mime
}

const BASE = "https://www.bsdc.bg/wp-content/uploads/2022/05"
const BASE06 = "https://www.bsdc.bg/wp-content/uploads/2022/06"
const BASE12 = "https://www.bsdc.bg/wp-content/uploads/2022/12"

const ASSETS: Asset[] = [
  // ── Logos ──────────────────────────────────────────────────────────────────
  { src: `${BASE}/logo.png`,                                                      local: "logo.png",                       alt: "BSDC logo",                       mime: "image/png"  },
  { src: `${BASE}/logowh.png`,                                                    local: "logo-white.png",                 alt: "BSDC logo white",                 mime: "image/png"  },
  { src: `${BASE}/cropped-logo.png`,                                              local: "logo-cropped.png",               alt: "BSDC logo cropped",               mime: "image/png"  },
  { src: `${BASE}/cropped-logowh-e1654965285700.png`,                            local: "logo-white-cropped.png",         alt: "BSDC logo white cropped",         mime: "image/png"  },

  // ── Hero / home ────────────────────────────────────────────────────────────
  { src: `${BASE}/commercial-diver-diving-helmet-5055614.jpg`,                   local: "hero-diver-helmet.jpg",          alt: "Commercial diver with diving helmet", mime: "image/jpeg" },

  // ── About ──────────────────────────────────────────────────────────────────
  { src: `${BASE}/diving-suit-old-historic-405730.jpg`,                          local: "about-diving-suit-historic.jpg", alt: "Historic diving suit",             mime: "image/jpeg" },

  // ── Certificates ───────────────────────────────────────────────────────────
  { src: `${BASE}/17320030-Black-Sea-Diving-Center-45001-bg-20-page-001-724x1024-1.jpg`, local: "cert-bsdc-45001.jpg",  alt: "BSDC 45001 certificate",          mime: "image/jpeg" },
  { src: `${BASE}/17320030-Black-Sea-Diving-Center-QM-bg-RECA-20-page-001-1086x1536-1.jpg`, local: "cert-bsdc-qm.jpg",  alt: "BSDC QM RECA certificate",        mime: "image/jpeg" },
  { src: `${BASE}/17320030-Black-Sea-Diving-Center-UM-bg-RECA-20-page-001-1086x1536-1.jpg`, local: "cert-bsdc-um.jpg",  alt: "BSDC UM RECA certificate",        mime: "image/jpeg" },
  { src: `${BASE}/ksb-4-34.jpg`,                                                 local: "cert-ksb.jpg",                   alt: "КСБ certificate",                 mime: "image/jpeg" },
  { src: `${BASE}/bkr.jpg`,                                                      local: "cert-bkr-doc.jpg",               alt: "BKR affiliation document",        mime: "image/jpeg" },
  { src: `${BASE}/bnapd.jpg`,                                                    local: "cert-bnapd-doc.jpg",             alt: "BNAPD affiliation document",      mime: "image/jpeg" },

  // ── Partner logos ──────────────────────────────────────────────────────────
  { src: `${BASE}/bkr.png`,                                                      local: "partner-bkr.png",                alt: "BKR logo",                        mime: "image/png"  },
  { src: `${BASE}/bnapd.png`,                                                    local: "partner-bnapd.png",              alt: "BNAPD logo",                      mime: "image/png"  },
  { src: `${BASE}/logobkr-e1654961894878.png`,                                   local: "partner-bkr-logo.png",           alt: "BKR logo variant",                mime: "image/png"  },
  { src: `${BASE}/Untitled-10.png`,                                              local: "partner-tuv-nord.png",           alt: "TÜV NORD logo",                   mime: "image/png"  },
  { src: `${BASE}/risklogo.png`,                                                  local: "partner-risk.png",               alt: "RISK logo",                       mime: "image/png"  },
  { src: `${BASE}/oh-miro-logo.png`,                                             local: "partner-oh-miro.png",            alt: "ОХМ logo",                        mime: "image/png"  },
  { src: `${BASE}/novasub-logo.png`,                                             local: "partner-novasub.png",            alt: "Nova Sub logo",                   mime: "image/png"  },
  { src: `${BASE}/EnPro-1.png`,                                                  local: "partner-energopro.png",          alt: "EnerGoPro logo",                  mime: "image/png"  },
  { src: `${BASE}/ecm.png`,                                                      local: "partner-ecm.png",                alt: "ECM logo",                        mime: "image/png"  },
  { src: `${BASE}/deez.png`,                                                     local: "partner-dezeeman.png",           alt: "Dezeeman logo",                   mime: "image/png"  },
  { src: `${BASE}/DCN-logo-centeredTagline1375x721.png`,                         local: "partner-dcn.png",                alt: "DCN logo",                        mime: "image/png"  },
  { src: `${BASE}/amron-logo-196w.png`,                                          local: "partner-amron.png",              alt: "AMRON logo",                      mime: "image/png"  },

  // ── Service featured images ────────────────────────────────────────────────
  // Source: URL paths confirm placement on specific service pages
  { src: `${BASE}/will-terra-Ncja-RB01lg-unsplash-scaled.jpg`,                  local: "service-diver-work.jpg",         alt: "Professional diver at work",      mime: "image/jpeg" },
  // /service/diving-services/ — this is the diving-services featured image
  { src: `${BASE}/hunter-nolan-kF4mfeXBDAs-unsplash-scaled.jpg`,                local: "service-diving-work.jpg",        alt: "Diving work underwater",          mime: "image/jpeg" },
  // general /service/ image
  { src: `${BASE}/mael-balland-NKk66EXjA4o-unsplash-scaled.jpg`,                local: "service-repair.jpg",             alt: "Underwater repair work",          mime: "image/jpeg" },
  { src: `${BASE}/background-scaled.jpg`,                                        local: "service-background.jpg",         alt: "Service background",              mime: "image/jpeg" },
  { src: `${BASE}/lbv-200-4-22167_1mg.jpg`,                                     local: "service-rov-lbv200.jpg",         alt: "ROV LBV-200",                     mime: "image/jpeg" },
  // /service/rov-services/
  { src: `${BASE}/lbv-300-5-22168_1mg.jpg`,                                     local: "service-rov-lbv300.jpg",         alt: "ROV LBV-300",                     mime: "image/jpeg" },
  { src: `${BASE}/t7mccao0-900.jpg`,                                             local: "service-rov-t7.jpg",             alt: "ROV T7",                          mime: "image/jpeg" },
  { src: `${BASE}/scan-2200m-2.jpg`,                                             local: "service-bathymetry-scan.jpg",    alt: "Bathymetry scan 2200m",           mime: "image/jpeg" },
  // /service/bathy-hidro/
  { src: `${BASE}/img617fa698b02c7.png`,                                         local: "service-bathymetry-img.png",     alt: "Bathymetry equipment image",      mime: "image/png"  },
  { src: `${BASE}/diver-scuba-divers-dive-668777.jpg`,                           local: "service-courses-scuba.jpg",      alt: "Scuba divers underwater",         mime: "image/jpeg" },
  { src: `${BASE}/why-chose-right-block.png`,                                    local: "service-why-choose.png",         alt: "Why choose BSDC",                 mime: "image/png"  },

  // ── General gallery (Media library) ───────────────────────────────────────
  { src: `${BASE}/dive-wreck-underwater-378287.jpg`,                             local: "gallery-dive-wreck.jpg",         alt: "Dive wreck underwater",           mime: "image/jpeg" },
  { src: `${BASE}/fog-early-in-the-fog-2776464.jpg`,                             local: "gallery-fog.jpg",                alt: "Foggy sea",                       mime: "image/jpeg" },
  { src: `${BASE}/sunset-port-cranes-4055837.jpg`,                               local: "gallery-sunset-port.jpg",        alt: "Sunset with port cranes",         mime: "image/jpeg" },
  { src: `${BASE}/sea-ocean-boat-3121435.jpg`,                                   local: "gallery-sea-boat.jpg",           alt: "Boat at sea",                     mime: "image/jpeg" },
  { src: `${BASE}/dive-old-under-water-677990.jpg`,                              local: "gallery-dive-old.jpg",           alt: "Historic dive underwater",        mime: "image/jpeg" },
  { src: `${BASE}/underwater-diver-helmet-diver-378216.jpg`,                     local: "gallery-diver-helmet.jpg",       alt: "Diver with helmet underwater",    mime: "image/jpeg" },
  { src: `${BASE}/Pic-5.jpg`,                                                    local: "gallery-pic-05.jpg",             alt: "Gallery photo 5",                 mime: "image/jpeg" },
  { src: `${BASE}/Pic-6.jpg`,                                                    local: "gallery-pic-06.jpg",             alt: "Gallery photo 6",                 mime: "image/jpeg" },
  { src: `${BASE}/Pic-7.jpg`,                                                    local: "gallery-pic-07.jpg",             alt: "Gallery photo 7",                 mime: "image/jpeg" },
  { src: `${BASE}/Pic-9.jpg`,                                                    local: "gallery-pic-09.jpg",             alt: "Gallery photo 9",                 mime: "image/jpeg" },
  { src: `${BASE}/Pic-10.jpg`,                                                   local: "gallery-pic-10.jpg",             alt: "Gallery photo 10",                mime: "image/jpeg" },
  { src: `${BASE}/Pic-11.jpg`,                                                   local: "gallery-pic-11.jpg",             alt: "Gallery photo 11",                mime: "image/jpeg" },
  { src: `${BASE}/Pic-13.jpg`,                                                   local: "gallery-pic-13.jpg",             alt: "Gallery photo 13",                mime: "image/jpeg" },
  { src: `${BASE}/Pic-13-2.jpg`,                                                 local: "gallery-pic-13b.jpg",            alt: "Gallery photo 13b",               mime: "image/jpeg" },
  { src: `${BASE}/Pic-13-3.jpg`,                                                 local: "gallery-pic-13c.jpg",            alt: "Gallery photo 13c (ROV)",         mime: "image/jpeg" },
  { src: `${BASE}/Pic-13-4.jpg`,                                                 local: "gallery-pic-13d.jpg",            alt: "Gallery photo 13d (ROV)",         mime: "image/jpeg" },
  { src: `${BASE}/Pic-15.jpg`,                                                   local: "gallery-pic-15.jpg",             alt: "Gallery photo 15",                mime: "image/jpeg" },
  { src: `${BASE}/Pic-15-1.jpg`,                                                 local: "gallery-pic-15b.jpg",            alt: "Gallery photo 15b",               mime: "image/jpeg" },
  // /service/rov-services/ gallery photos
  { src: `${BASE}/Pic-12.jpg`,                                                   local: "gallery-pic-12.jpg",             alt: "Gallery photo 12 (ROV)",          mime: "image/jpeg" },
  { src: `${BASE}/img.jpg`,                                                      local: "gallery-img.jpg",                alt: "BSDC gallery image",              mime: "image/jpeg" },
  { src: `${BASE}/img1.jpg`,                                                     local: "gallery-img1.jpg",               alt: "BSDC gallery image 1",            mime: "image/jpeg" },
  { src: `${BASE}/img2.jpg`,                                                     local: "gallery-img2.jpg",               alt: "BSDC gallery image 2",            mime: "image/jpeg" },
  { src: `${BASE}/11.jpg`,                                                       local: "gallery-11.jpg",                 alt: "BSDC gallery 11",                 mime: "image/jpeg" },
  { src: `${BASE}/service-thumb-sdam.jpg`,                                       local: "gallery-sdam.jpg",               alt: "SDAM service image",              mime: "image/jpeg" },
  // Used as micro-dam-operation featured image (service-thumb-sdam = dam operator thumbnail)
  { src: `${BASE}/water-dive-underwater-1652868.jpg`,                            local: "gallery-water-dive.jpg",         alt: "Water dive underwater",           mime: "image/jpeg" },
  { src: `${BASE}/diver-diving-underwater-83508.jpg`,                            local: "gallery-diver-underwater.jpg",   alt: "Diver diving underwater",         mime: "image/jpeg" },
  // Diving services page gallery (Pic-3 is specifically under /service/diving-services/)
  { src: `${BASE}/Pic-3-scaled.jpg`,                                             local: "gallery-pic-03.jpg",             alt: "Diving services gallery photo",   mime: "image/jpeg" },
  // Pic-1 is root-level media (not tied to any specific section)
  { src: `${BASE}/Pic-1-scaled.jpg`,                                             local: "gallery-pic-01.jpg",             alt: "BSDC site photo 1",               mime: "image/jpeg" },

  // ── Bathymetry data images ─────────────────────────────────────────────────
  { src: `${BASE}/0-02-0a-98afc3891876b82b5ffbd02d702eb7aee26d74c8358edcdaa8e5c84c945436ee_467e55702f8cd5f7.jpg`, local: "service-bathymetry-data-01.jpg", alt: "Bathymetry data scan 01", mime: "image/jpeg" },
  { src: `${BASE}/0-02-05-2dbfc254a383a41cd0d6554e731db50f9650dd9bc7e3a0941706ecb49702060c_17e3645e1400e2a0.jpg`, local: "service-bathymetry-data-02.jpg", alt: "Bathymetry data scan 02", mime: "image/jpeg" },
  { src: `${BASE}/0-02-05-13440a6ce851d842d2da37a456489909da10ccec479391c21175feb1839fc307_9500d7db4d360353.jpg`, local: "service-bathymetry-data-03.jpg", alt: "Bathymetry data scan 03", mime: "image/jpeg" },
  { src: `${BASE}/0-02-05-c70877c93dec5224b9a476ba558d77d07a0db72a0f7e3774e442809e7aae009f_4fa02fd00f024be4.jpg`, local: "service-bathymetry-data-04.jpg", alt: "Bathymetry data scan 04", mime: "image/jpeg" },

  // ── News article photos (office move 2022) ────────────────────────────────
  // Source: /news/нова-локация-на-производствена-и-офис/ — news post about new office location
  { src: `${BASE}/20220430_115156-scaled.jpg`,                                   local: "news-20220430.jpg",              alt: "BSDC office photo April 2022",    mime: "image/jpeg" },
  { src: `${BASE}/20220531_135307-scaled.jpg`,                                   local: "news-20220531-a.jpg",            alt: "BSDC news May 2022",              mime: "image/jpeg" },
  { src: `${BASE}/20220531_135322-scaled.jpg`,                                   local: "news-20220531-b.jpg",            alt: "BSDC news May 2022 (2)",          mime: "image/jpeg" },
  { src: `${BASE}/20220531_135355-scaled.jpg`,                                   local: "news-20220531-c.jpg",            alt: "BSDC news May 2022 (3)",          mime: "image/jpeg" },
  { src: `${BASE}/20220531_135424-scaled.jpg`,                                   local: "news-20220531-d.jpg",            alt: "BSDC news May 2022 (4)",          mime: "image/jpeg" },

  // ── Project photos — Язлата dam rehabilitation (Ясна Поляна) ──────────────
  // Source: /news/ясна-поляна/ — WP post for yazlata-dam-rehabilitation-2022
  { src: `${BASE12}/viber_image_2022-12-20_14-55-22-883.jpg`,                   local: "project-yazlata-a.jpg",          alt: "Язовир Язлата - Ясна Поляна рехабилитация", mime: "image/jpeg" },
  { src: `${BASE12}/viber_image_2022-12-20_14-55-22-964.jpg`,                   local: "project-yazlata-b.jpg",          alt: "Язовир Язлата - Ясна Поляна рехабилитация 2", mime: "image/jpeg" },

  // ── Project photos — Кърджали dam inspection (язовирна стена) ─────────────
  // Source: /news/подводен-оглед-на-ои-на-язовирна-стена/ — WP post for kardzhali-dam
  { src: `${BASE12}/319285632_544919033903167_4644979806522956283_n.jpg`,        local: "project-kardzhali-a.jpg",        alt: "Кърджали язовир - инспекция на ОИ", mime: "image/jpeg" },
  { src: `${BASE12}/318767557_1671675679897121_2957396809519617307_n.jpg`,       local: "project-kardzhali-b.jpg",        alt: "Кърджали язовир - инспекция на ОИ 2", mime: "image/jpeg" },

  // ── Project photos — Тешел dam inspection ─────────────────────────────────
  // Source: /news/подводен-оглед-на-ои-на-язовир-тешал/ — WP post for teshal-dam
  { src: `${BASE12}/319870930_684958709827973_1795818227832579343_n.jpg`,        local: "project-teshal-a.jpg",           alt: "Язовир Тешел - инспекция на ОИ",  mime: "image/jpeg" },
  { src: `${BASE12}/318757366_1836245376758512_6293200578829242069_n.jpg`,       local: "project-teshal-b.jpg",           alt: "Язовир Тешел - инспекция на ОИ 2", mime: "image/jpeg" },

  // ── Project photos — Пещера HPP intake tower inspection ───────────────────
  // Source: /news/подводен-оглед-на-водовземна-кула-за/ — WP post for peshtera-hec
  { src: `${BASE12}/20221026_194349-scaled.jpg`,                                 local: "project-peshtera-a.jpg",         alt: "ВЕЦ Пещера - водовземна кула инспекция", mime: "image/jpeg" },
  { src: `${BASE12}/20221027_123703-scaled.jpg`,                                 local: "project-peshtera-b.jpg",         alt: "ВЕЦ Пещера - водовземна кула инспекция 2", mime: "image/jpeg" },

  // ── Project photos — additional WP news items ─────────────────────────────
  // Source: /news/оглед-и-оценка-на-състоянието-на-гнд-з/ — GND inspection
  { src: `https://bsdc.bg/wp-content/uploads/2022/03/zx1278_1137945.jpg`,       local: "project-gnd-survey.jpg",         alt: "Оглед и оценка на ГНД за язовир",  mime: "image/jpeg" },

  // Source: /news/ремонтно-възстановителни-и-укрепит/ — repair and restoration works
  { src: `${BASE06}/20220207_084401-scaled.jpg`,                                 local: "project-repair-works-a.jpg",     alt: "Ремонтно-възстановителни работи",  mime: "image/jpeg" },

  // Source: /news/подводен-оглед-на-ои-на-язовир-алекс/ — Alexander Stamboliyski
  { src: `${BASE06}/20211005_101810-scaled-e1654157161626.jpg`,                  local: "project-alex-stamboliyski.jpg",  alt: "Инспекция язовир Александър Стамболийски", mime: "image/jpeg" },

  // Source: /news/ремонт-на-свод-на-входна-шахта-на-дес/ — inlet shaft repair
  { src: `${BASE06}/20200427_112209-scaled.jpg`,                                 local: "project-shaft-repair.jpg",       alt: "Ремонт на свод на входна шахта",   mime: "image/jpeg" },

  // Source: /news/вец-луковит-проектиране-достав/ — HPP Lukovit design+delivery
  { src: `${BASE06}/93106307_3100604553293088_6660700862492442624_n_3100604549959755.jpg`, local: "project-lukovit-hec.jpg", alt: "ВЕЦ Луковит - проектиране и доставка", mime: "image/jpeg" },

  // Source: /news/подводен-оглед-на-съоръженията-яз-сту/ — dam structure inspection Sep 2022
  { src: `${BASE12}/20220912_101951-scaled.jpg`,                                 local: "project-sooruzheniya-a.jpg",     alt: "Подводен оглед на съоръженията на язовир", mime: "image/jpeg" },
]

// ─────────────────────────────────────────────────────────────────────────────
// Download helper — handles redirects, timeouts, skip-if-exists
// ─────────────────────────────────────────────────────────────────────────────

function fetchFile(url: string, destPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(destPath)) {
      resolve(fs.statSync(destPath).size)
      return
    }

    const client = url.startsWith("https") ? https : http
    const file = fs.createWriteStream(destPath)

    const cleanup = () => {
      try { file.close() } catch { /* ignore */ }
      if (fs.existsSync(destPath)) {
        try { fs.unlinkSync(destPath) } catch { /* ignore */ }
      }
    }

    const req = client.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        cleanup()
        fetchFile(res.headers.location!, destPath).then(resolve).catch(reject)
        return
      }
      if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
        cleanup()
        reject(new Error(`HTTP ${res.statusCode}`))
        return
      }
      res.pipe(file)
      file.on("finish", () => {
        file.close()
        resolve(fs.statSync(destPath).size)
      })
      file.on("error", (e) => { cleanup(); reject(e) })
    })

    req.on("error", (e) => { cleanup(); reject(e) })
    req.setTimeout(30_000, () => {
      req.destroy()
      cleanup()
      reject(new Error("Timed out after 30s"))
    })
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Media record helper — idempotent (skip if URL already registered)
// ─────────────────────────────────────────────────────────────────────────────

async function upsertMedia(asset: Asset, size: number) {
  const url = `/uploads/bsdc/${asset.local}`
  const existing = await prisma.media.findFirst({ where: { url } })
  if (!existing) {
    await prisma.media.create({
      data: { filename: asset.local, url, altText: asset.alt, mimeType: asset.mime, size },
    })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  await fsp.mkdir(DEST, { recursive: true })

  console.log(`\nPhase 1 — Downloading ${ASSETS.length} assets to ${DEST}\n`)

  for (const asset of ASSETS) {
    const destPath = path.join(DEST, asset.local)
    const existed = fs.existsSync(destPath)
    try {
      const size = await fetchFile(asset.src, destPath)
      if (existed) {
        alreadyExisted.push(asset.local)
      } else {
        downloaded.push(asset.local)
        console.log(`  ✓  ${asset.local}`)
      }
      await upsertMedia(asset, size)
    } catch (e) {
      failed.push(`${asset.local} (${asset.src})`)
      console.warn(`  ✗  TODO: ${asset.local} — ${(e as Error).message}`)
    }
  }

  console.log(`\nPhase 2 — Updating CMS records\n`)

  // ── Home hero ────────────────────────────────────────────────────────────────
  await prisma.homeContent.updateMany({
    where: { OR: [{ heroImageUrl: null }, { heroImageUrl: { contains: "bsdc.bg" } }] },
    data: { heroImageUrl: "/uploads/bsdc/hero-diver-helmet.jpg" },
  })
  console.log("  ✓  HomeContent.heroImageUrl")

  // ── About image ──────────────────────────────────────────────────────────────
  await prisma.aboutContent.updateMany({
    where: { OR: [{ imageUrl: null }, { imageUrl: { contains: "bsdc.bg" } }] },
    data: { imageUrl: "/uploads/bsdc/about-diving-suit-historic.jpg" },
  })
  console.log("  ✓  AboutContent.imageUrl")

  // ── Site logo ────────────────────────────────────────────────────────────────
  await prisma.siteSetting.updateMany({
    where: { OR: [{ logoUrl: null }, { logoUrl: { contains: "bsdc.bg" } }] },
    data: { logoUrl: "/uploads/bsdc/logo.png" },
  })
  console.log("  ✓  SiteSetting.logoUrl")

  // ── Service featured images ───────────────────────────────────────────────────
  // Mapping verified against WordPress source URL paths:
  // - diving-services: will-terra image is specifically at /service/diving-services/
  //   (hunter-nolan is at general /service/ level only)
  // - micro-dam-operation: service-thumb-sdam.jpg = SDAM operator thumbnail
  // - rov-services: lbv-200 is at /service/rov-services/
  // - bathymetry-hydrography: scan-2200m is at /service/bathy-hidro/
  const svcImages: Array<{ key: string; url: string; prev?: string }> = [
    // Fixed: was service-diving-work.jpg (hunter-nolan, generic /service/ level)
    { key: "diving-services",        url: "/uploads/bsdc/service-diver-work.jpg",         prev: "/uploads/bsdc/service-diving-work.jpg" },
    { key: "rov-services",           url: "/uploads/bsdc/service-rov-lbv200.jpg" },
    // Fixed: was service-background.jpg (generic); service-thumb-sdam.jpg is the SDAM operator image
    { key: "micro-dam-operation",    url: "/uploads/bsdc/gallery-sdam.jpg",                prev: "/uploads/bsdc/service-background.jpg" },
    { key: "port-vessel-dam-repairs",url: "/uploads/bsdc/service-repair.jpg" },
    { key: "bathymetry-hydrography", url: "/uploads/bsdc/service-bathymetry-scan.jpg" },
    { key: "diving-courses",         url: "/uploads/bsdc/service-courses-scuba.jpg" },
  ]

  for (const { key, url, prev } of svcImages) {
    // Only update if: null, old WP URL, or the specific previous wrong import value
    const prevConditions = [
      { featuredImageUrl: null },
      { featuredImageUrl: { contains: "bsdc.bg" } },
      ...(prev ? [{ featuredImageUrl: prev }] : []),
    ]
    await prisma.service.updateMany({
      where: { language: "BG", translationKey: key, OR: prevConditions },
      data: { featuredImageUrl: url },
    })
  }
  console.log("  ✓  Service.featuredImageUrl (6 services — corrected)")

  // ── Project featured images — corrected with actual WP project photos ─────────
  // Previous import used stock/generic images; now replaced with real site photos
  // from the matched WordPress news posts (decoded from URL slugs in CSV).
  const prjCorrections = [
    {
      key: "yazlata-dam-rehabilitation-2022",
      url: "/uploads/bsdc/project-yazlata-a.jpg",
      // WP post: /news/ясна-поляна/ — photos from Dec 2022
      prev: ["/uploads/bsdc/project-dam-barrier.jpg"],
    },
    {
      key: "kardzhali-dam-rov-inspection-2022",
      url: "/uploads/bsdc/project-kardzhali-a.jpg",
      // WP post: /news/подводен-оглед-на-ои-на-язовирна-стена/ — photos from Dec 2022
      prev: ["/uploads/bsdc/project-pic-01.jpg", "/uploads/bsdc/gallery-pic-01.jpg"],
    },
    {
      key: "teshal-dam-devin-inspection-2022",
      url: "/uploads/bsdc/project-teshal-a.jpg",
      // WP post: /news/подводен-оглед-на-ои-на-язовир-тешал/ — photos from Dec 2022
      prev: ["/uploads/bsdc/project-lake-reservoir.jpg"],
    },
    {
      key: "peshtera-hec-intake-inspection-2022",
      url: "/uploads/bsdc/project-peshtera-a.jpg",
      // WP post: /news/подводен-оглед-на-водовземна-кула-за/ — photos from Oct-Dec 2022
      // Previously wrong: project-pic-03.jpg is a diving-services gallery image, not a project photo
      prev: ["/uploads/bsdc/project-pic-03.jpg"],
    },
  ]

  for (const { key, url, prev } of prjCorrections) {
    await prisma.projectNewsItem.updateMany({
      where: {
        language: "BG",
        translationKey: key,
        OR: [
          { featuredImageUrl: null },
          { featuredImageUrl: { contains: "bsdc.bg" } },
          ...prev.map((p) => ({ featuredImageUrl: p })),
        ],
      },
      data: { featuredImageUrl: url },
    })
  }
  console.log("  ✓  ProjectNewsItem.featuredImageUrl (4 projects — corrected)")

  // ── Partners — upsert by name ─────────────────────────────────────────────────
  const partners = [
    { name: "TÜV NORD",   logoUrl: "/uploads/bsdc/partner-tuv-nord.png",  sortOrder: 1 },
    { name: "РИСК",       logoUrl: "/uploads/bsdc/partner-risk.png",       sortOrder: 2 },
    { name: "ОХМ",        logoUrl: "/uploads/bsdc/partner-oh-miro.png",    sortOrder: 3 },
    { name: "Nova Sub",   logoUrl: "/uploads/bsdc/partner-novasub.png",    sortOrder: 4 },
    { name: "EnerGoPro",  logoUrl: "/uploads/bsdc/partner-energopro.png",  sortOrder: 5 },
    { name: "ECM",        logoUrl: "/uploads/bsdc/partner-ecm.png",        sortOrder: 6 },
    { name: "Dezeeman",   logoUrl: "/uploads/bsdc/partner-dezeeman.png",   sortOrder: 7 },
    { name: "DCN",        logoUrl: "/uploads/bsdc/partner-dcn.png",        sortOrder: 8 },
    { name: "AMRON",      logoUrl: "/uploads/bsdc/partner-amron.png",      sortOrder: 9 },
    { name: "БКР",        logoUrl: "/uploads/bsdc/partner-bkr.png",        sortOrder: 10 },
    { name: "БНАПД",      logoUrl: "/uploads/bsdc/partner-bnapd.png",      sortOrder: 11 },
  ]
  for (const p of partners) {
    const existing = await prisma.partner.findFirst({ where: { name: p.name } })
    if (!existing) {
      await prisma.partner.create({ data: { ...p, published: true } })
    } else if (!existing.logoUrl || existing.logoUrl.includes("bsdc.bg")) {
      await prisma.partner.update({ where: { id: existing.id }, data: { logoUrl: p.logoUrl } })
    }
  }
  console.log("  ✓  Partner records (11 partners)")

  // ── Certificates — upsert by language + translationKey ───────────────────────
  const certs = [
    {
      translationKey: "bsdc-iso-45001",
      title: "Сертификат ISO 45001",
      issuer: "RECA",
      imageUrl: "/uploads/bsdc/cert-bsdc-45001.jpg",
      description: "Сертификат по система за управление на здравето и безопасността при работа",
      sortOrder: 1,
    },
    {
      translationKey: "bsdc-qm-reca",
      title: "Сертификат QM RECA",
      issuer: "RECA",
      imageUrl: "/uploads/bsdc/cert-bsdc-qm.jpg",
      description: "Сертификат за управление на качеството",
      sortOrder: 2,
    },
    {
      translationKey: "bsdc-um-reca",
      title: "Сертификат UM RECA",
      issuer: "RECA",
      imageUrl: "/uploads/bsdc/cert-bsdc-um.jpg",
      description: "Сертификат за управление на околната среда",
      sortOrder: 3,
    },
    {
      translationKey: "bsdc-ksb",
      title: "Членство КСБ",
      issuer: "Камара на строителите в България",
      imageUrl: "/uploads/bsdc/cert-ksb.jpg",
      description: "Камара на строителите в България",
      sortOrder: 4,
    },
  ]
  for (const cert of certs) {
    await prisma.certificate.upsert({
      where: { language_translationKey: { language: "BG", translationKey: cert.translationKey } },
      update: { imageUrl: cert.imageUrl },
      create: { language: "BG", ...cert, published: true },
    })
  }
  console.log("  ✓  Certificate records (4 certificates)")

  // ── Phase 3: Additional news/project items from WP export ─────────────────────
  // Items discovered by decoding the URL-encoded Cyrillic slugs in the CSV.
  // Titles are derived from URL slugs; excerpt/content need manual review.
  // Dates are based on photo filenames embedded in the WP URLs.
  // Only creates records that do not already exist (safe to re-run).
  console.log(`\nPhase 3 — Adding additional news/project items from WP export\n`)

  type NewItem = {
    translationKey: string
    slug: string
    title: string
    excerpt: string
    type: ProjectNewsType
    publishedAt: Date
    featuredImageUrl: string | null
    sortOrder: number
  }

  const newItems: NewItem[] = [
    {
      // WP URL: /news/нова-локация-на-производствена-и-офис/
      // Photos: 20220430_115156, 20220531_135307, etc. from /2022/05/
      translationKey: "nova-lokatsiya-ofis-baza-2022",
      slug: "nova-lokatsiya-na-ofis-baza-2022",
      title: "Нова локация на производствена и офис база",
      excerpt: "Черноморски Водолазен Център ООД се премести в нова производствена и офис база.",
      type: ProjectNewsType.NEWS,
      publishedAt: new Date("2022-06-01"),
      featuredImageUrl: "/uploads/bsdc/news-20220430.jpg",
      sortOrder: 20,
    },
    {
      // WP URL: /news/оглед-и-оценка-на-състоянието-на-гнд-з/
      // Photos: hash-named from /2022/05/ and zx1278_1137945 from /2022/03/
      translationKey: "ogled-otsenka-gnd-2022",
      slug: "ogled-i-otsenka-na-gnd-2022",
      title: "Оглед и оценка на състоянието на ГНД за язовир",
      excerpt: "Оглед и оценка на техническото състояние на главния напорен дренаж (ГНД) за язовир.",
      type: ProjectNewsType.PROJECT,
      publishedAt: new Date("2022-03-01"),
      featuredImageUrl: "/uploads/bsdc/project-gnd-survey.jpg",
      sortOrder: 21,
    },
    {
      // WP URL: /news/ремонтно-възстановителни-и-укрепит/
      // Photos: 20220207, 20220117, 20220128, 20220210, 20220304 from /2022/06/
      translationKey: "remontno-vazstanovitelni-2022",
      slug: "remontno-vazstanovitelni-i-ukrepitelni-raboti-2022",
      title: "Ремонтно-възстановителни и укрепителни работи",
      excerpt: "Ремонтно-възстановителни и укрепителни работи по хидротехнически съоръжения.",
      type: ProjectNewsType.PROJECT,
      publishedAt: new Date("2022-04-01"),
      featuredImageUrl: "/uploads/bsdc/project-repair-works-a.jpg",
      sortOrder: 22,
    },
    {
      // WP URL: /news/подводен-оглед-на-основен-изпускате/
      // Photos: hash-named from /2022/06/ — no clean local filename available
      translationKey: "podvoden-ogled-osnoven-izpuskatel-2022",
      slug: "podvoden-ogled-na-osnoven-izpuskatel-2022",
      title: "Подводен оглед на основен изпускател",
      excerpt: "Подводна инспекция на основния изпускателен орган на язовирно съоръжение.",
      type: ProjectNewsType.PROJECT,
      publishedAt: new Date("2022-07-01"),
      // TODO: download hash-named images from /2022/06/ once identified
      featuredImageUrl: null,
      sortOrder: 23,
    },
    {
      // WP URL: /news/подводен-оглед-на-ои-на-язовир-алекс/
      // Photos: 20211005_101810, DSC_0329, DSC_0332, DSC_0342 from /2022/06/
      translationKey: "podvoden-ogled-alex-stamboliyski-2021",
      slug: "podvoden-ogled-na-oi-na-yazovir-aleksandar-stamboliyski",
      title: "Подводен оглед на ОИ на язовир Александър Стамболийски",
      excerpt: "Подводна инспекция на основния изпускател (ОИ) на язовир Александър Стамболийски.",
      type: ProjectNewsType.PROJECT,
      publishedAt: new Date("2021-10-05"),
      featuredImageUrl: "/uploads/bsdc/project-alex-stamboliyski.jpg",
      sortOrder: 24,
    },
    {
      // WP URL: /news/ремонт-на-свод-на-входна-шахта-на-дес/
      // Photos: 20200427 and 20201110, 20201122 from /2022/06/
      translationKey: "remont-svod-shahta-2020",
      slug: "remont-na-svod-na-vhodna-shahta-2020",
      title: "Ремонт на свод на входна шахта на десничен берови изсмуквач",
      excerpt: "Ремонт на свода на входната шахта на десничен берови изсмуквач на хидровъзел.",
      type: ProjectNewsType.PROJECT,
      publishedAt: new Date("2020-11-01"),
      featuredImageUrl: "/uploads/bsdc/project-shaft-repair.jpg",
      sortOrder: 25,
    },
    {
      // WP URL: /news/вец-луковит-проектиране-достав/
      // Photos: Facebook-ID photos from /2022/06/
      translationKey: "vets-lukovit-proektirane-2020",
      slug: "vets-lukovit-proektirane-i-dostavka-na-oborudvane",
      title: "ВЕЦ Луковит — Проектиране и доставка на оборудване",
      excerpt: "Проектиране и доставка на специализирано оборудване за ВЕЦ Луковит.",
      type: ProjectNewsType.PROJECT,
      publishedAt: new Date("2020-06-01"),
      featuredImageUrl: "/uploads/bsdc/project-lukovit-hec.jpg",
      sortOrder: 26,
    },
    {
      // WP URL: /news/подводен-оглед-на-съоръженията-яз-сту/
      // Photos: 20220912 from /2022/12/ — September 2022 dam structure inspection
      translationKey: "podvoden-ogled-sooruzheniya-2022",
      slug: "podvoden-ogled-na-sooruzheniya-yazovir-2022",
      title: "Подводен оглед на съоръженията на язовир",
      excerpt: "Подводна инспекция на съоръженията на язовирно тяло и прилежащите конструкции.",
      type: ProjectNewsType.PROJECT,
      publishedAt: new Date("2022-09-12"),
      featuredImageUrl: "/uploads/bsdc/project-sooruzheniya-a.jpg",
      sortOrder: 27,
    },
    {
      // WP URL: /news/разхлабването-на-болтовите-връзки-на/
      // Photos: hash-named from /2022/12/ — no clean local filename available
      translationKey: "razhlabvane-boltove-2022",
      slug: "razhlabvane-na-boltovite-vrazki-2022",
      title: "Разхлабването на болтовите връзки на съоръжение",
      excerpt: "Диагностика и ремонт на разхлабени болтови връзки на хидротехническо съоръжение.",
      type: ProjectNewsType.PROJECT,
      publishedAt: new Date("2022-11-01"),
      // TODO: hash-named images from /2022/12/ not yet downloaded
      featuredImageUrl: null,
      sortOrder: 28,
    },
  ]

  let added = 0
  let skipped = 0
  for (const item of newItems) {
    const existing = await prisma.projectNewsItem.findFirst({
      where: { language: "BG", translationKey: item.translationKey },
    })
    if (!existing) {
      await prisma.projectNewsItem.create({
        data: {
          language: "BG",
          translationKey: item.translationKey,
          slug: item.slug,
          title: item.title,
          excerpt: item.excerpt,
          type: item.type,
          publishedAt: item.publishedAt,
          featuredImageUrl: item.featuredImageUrl,
          sortOrder: item.sortOrder,
          published: true,
        },
      })
      console.log(`  ✓  Added: ${item.title}`)
      added++
    } else {
      skipped++
    }
  }
  console.log(`  ✓  ${added} new items added, ${skipped} already existed`)

  // ── Phase 4: Service content + gallery images ─────────────────────────────────
  // Content extracted from live bsdc.bg service pages.
  // Gallery images assigned from confirmed local paths only.
  console.log(`\nPhase 4 — Updating service content and gallery images\n`)

  type ServiceContent = {
    translationKey: string
    shortDescription: string
    content: string
    images: string[]
  }

  const serviceContent: ServiceContent[] = [
    {
      translationKey: "diving-services",
      shortDescription:
        "Водеща компания за водолазни услуги с въздух или газови смеси в нефтената индустрия, пристанищна инфраструктура, язовири и ВЕЦ.",
      content:
        "<p>Ние сме водеща компания за водолазни услуги с въздух или газови смеси в нефтената индустрия, пристанищна инфраструктура, язовири и ВЕЦ.</p>" +
        "<h3>Основни дейности</h3>" +
        "<ul><li>Хидротехническо строителство, реконструкция и подводни ремонти</li>" +
        "<li>Ремонт на фуги и пукнатини на бетонни повърхности</li>" +
        "<li>Нанасяне на антикорозионни покрития</li>" +
        "<li>Полагане на кабели и армировъчни мрежи</li>" +
        "<li>Аварийни ремонти в работни условия</li>" +
        "<li>Инжекционни работи, рязане и пробиване на бетон</li>" +
        "<li>Подводно заваряване</li></ul>" +
        "<h3>Обслужвани съоръжения</h3>" +
        "<ul><li>Основни изпускатели и водовземни кули</li>" +
        "<li>Язовирни стени и ВЕЦ</li>" +
        "<li>Пристанищна инфраструктура и кейове</li>" +
        "<li>Мостове и подводни тунели</li>" +
        "<li>Тръбопроводи и офшорни платформи</li></ul>",
      images: [
        "/uploads/bsdc/gallery-diver-underwater.jpg",
        "/uploads/bsdc/gallery-diver-helmet.jpg",
        "/uploads/bsdc/gallery-pic-03.jpg",
      ],
    },
    {
      translationKey: "rov-services",
      shortDescription:
        "Дистанционно управляеми подводни апарати за безопасни инспекции до 300 м дълбочина.",
      content:
        "<p>Разполагаме с две ROV системи за инспекции до 300 м дълбочина и обхват 350 м, подходящи за тръби от 350 мм диаметър.</p>" +
        "<h3>Технически характеристики</h3>" +
        "<ul><li>Максимална дълбочина: 300 м</li>" +
        "<li>Максимален обхват: 350 м</li>" +
        "<li>Минимален диаметър на тръба: 350 мм</li></ul>" +
        "<h3>Оборудване</h3>" +
        "<ul><li>Страничен скенер Tritech DST Micron</li>" +
        "<li>Цветна видеокамера и B&amp;W камера за слаба светлина</li>" +
        "<li>Роботизирана ръка и GPS позициониране</li>" +
        "<li>Термометър и манометър</li></ul>" +
        "<h3>Приложения</h3>" +
        "<ul><li>Инспекция на закрити пространства и тръбопроводи</li>" +
        "<li>Издирване на потопени обекти</li>" +
        "<li>Безопасна алтернатива на водолазни работи</li></ul>",
      images: [
        "/uploads/bsdc/service-rov-lbv300.jpg",
        "/uploads/bsdc/service-rov-t7.jpg",
        "/uploads/bsdc/gallery-pic-13c.jpg",
        "/uploads/bsdc/gallery-pic-13d.jpg",
      ],
    },
    {
      translationKey: "micro-dam-operation",
      shortDescription:
        "Пълно техническо обслужване, мониторинг и управление на язовири и хидротехнически съоръжения от квалифициран хидроспециалист.",
      content:
        "<p>Съгласно чл. 138в, ал. 1 от Закона за водите, собствениците на язовири са длъжни да наемат квалифициран оператор при невъзможност да спазят законовите изисквания сами.</p>" +
        "<h3>Дейности</h3>" +
        "<ul><li>Измервания чрез контролно-измервателни системи (КИС)</li>" +
        "<li>Обработка на данни от системите за мониторинг</li>" +
        "<li>Оценка на техническото състояние на язовири</li>" +
        "<li>Разработване и актуализиране на програми за техническо наблюдение</li>" +
        "<li>Изготвяне и актуализиране на аварийни планове</li>" +
        "<li>Въвеждане на данни в системите на ДНТН</li>" +
        "<li>Периодични доклади за техническото състояние</li></ul>",
      images: [],
    },
    {
      translationKey: "port-vessel-dam-repairs",
      shortDescription:
        "Подводни ремонти на пристанищна инфраструктура, кораби, язовири и хидротехнически съоръжения. Сертифицирани от TÜV Nord и БКР.",
      content:
        "<h3>Пристанища и кораби</h3>" +
        "<ul><li>Подводни и надводни замервания</li>" +
        "<li>Почистване на корпуси от морски обраствания</li>" +
        "<li>Инспекция и ремонт на корпуси на кораби</li>" +
        "<li>Измерване на дебелина на стени с ултразвук (до 250 мм)</li>" +
        "<li>Обслужване на гребни винтове, валови уплътнения и кингстони</li>" +
        "<li>Подводно рязане и заваряване</li></ul>" +
        "<h3>Язовири и хидросъоръжения</h3>" +
        "<ul><li>Изграждане на защитни конструкции</li>" +
        "<li>Подводна фото и видеодокументация</li>" +
        "<li>Рехабилитация на затвори и монтаж на преливници</li>" +
        "<li>Ремонт на бетон и укрепване на насипи</li></ul>" +
        "<p><strong>Сертифицирани:</strong> TÜV Nord и БКР</p>",
      images: [
        "/uploads/bsdc/gallery-sea-boat.jpg",
        "/uploads/bsdc/gallery-sunset-port.jpg",
      ],
    },
    {
      translationKey: "bathymetry-hydrography",
      shortDescription:
        "Прецизни подводни измервания и сканиране на дъното с водещи сонарни системи Tritech и Humminbird.",
      content:
        "<p>Използваме водещи сонарни системи Tritech и Humminbird за прецизно акустично изображение на морското дъно и подводни обекти.</p>" +
        "<h3>Приложения</h3>" +
        "<ul><li>Локализиране на изпускатели и потопени кораби</li>" +
        "<li>Издирване на котви и произволни обекти</li>" +
        "<li>Инспекция на мостове, кейове и тунели</li>" +
        "<li>Мониторинг на ерозия с детайлни триизмерни модели</li>" +
        "<li>Хидрографски проучвания и анализ на течения</li></ul>",
      images: [
        "/uploads/bsdc/service-bathymetry-data-01.jpg",
        "/uploads/bsdc/service-bathymetry-data-02.jpg",
        "/uploads/bsdc/service-bathymetry-data-03.jpg",
        "/uploads/bsdc/service-bathymetry-data-04.jpg",
      ],
    },
    {
      translationKey: "diving-courses",
      shortDescription:
        "Сертифицирано обучение за любителско гмуркане по системите NAUI и CMAS — Черноморски Водолазен Център, Варна.",
      content:
        "<p>Черноморски Водолазен Център — Варна е лицензирано учебно заведение за любителско гмуркане по системите NAUI и CMAS.</p>" +
        "<h3>Курсове</h3>" +
        "<ul><li><strong>Diving Experience</strong> — 90 € (едно гмуркане за начинаещи)</li>" +
        "<li><strong>Passport Scuba Diver</strong> — 390 € (двудневна програма, до 12 м)</li>" +
        "<li><strong>Scuba Diver Course</strong> — 500 € (четиридневна програма)</li>" +
        "<li><strong>Master Scuba Diver</strong> — 1 200 € (десетдневна интензивна програма)</li></ul>" +
        "<h3>Локации</h3>" +
        "<ul><li>Тюленово, Нос Калиакра, Болата</li>" +
        "<li>Гмуркане при пещери, рифове и потопени кораби</li></ul>",
      images: [
        "/uploads/bsdc/gallery-dive-old.jpg",
        "/uploads/bsdc/gallery-dive-wreck.jpg",
      ],
    },
  ]

  for (const svc of serviceContent) {
    await prisma.service.updateMany({
      where: { language: "BG", translationKey: svc.translationKey },
      data: {
        shortDescription: svc.shortDescription,
        content: svc.content,
        images: svc.images,
      },
    })
    console.log(`  ✓  ${svc.translationKey}`)
  }
  console.log(`  ✓  Service content + gallery updated (${serviceContent.length} services)`)

  // Summary
  const totalNew = downloaded.length
  const totalSkipped = alreadyExisted.length
  const totalFailed = failed.length

  console.log("\n─── Summary " + "─".repeat(50))
  console.log(`  Newly downloaded:      ${totalNew}`)
  console.log(`  Already existed:       ${totalSkipped}`)
  console.log(`  Failed (TODO):         ${totalFailed}`)
  if (totalFailed > 0) {
    console.log("\n  Failed URLs:")
    failed.forEach((f) => console.log(`    ✗ ${f}`))
  }
  console.log(`\n  All media paths are local Next.js public paths (/uploads/bsdc/*).`)
  console.log(`  Run again at any time — already-downloaded files are not re-fetched.\n`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
