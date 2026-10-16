#!/usr/bin/env node
// UI check for app-motion: screenshots in light + dark, text contrast, reduced motion.
//
// Usage (start the app first, e.g. `npm run dev` or `npm run build && npx vite preview`):
//   node check-ui.mjs --url http://localhost:5173 --routes /,/quiz/travel --out ./ui-check
// Options:
//   --dark-class         dark mode is a `dark` class on <html> (Tailwind darkMode:'class'),
//                        not prefers-color-scheme
//   --click "<selector>" click this element before checking, on routes where it exists
//                        (e.g. the correct answer, to see feedback colors and confetti)
//   --width 390          viewport width (default 390, a phone)
//
// Prints a Markdown table to paste into the report and exits 1 if any check fails.
// Needs Playwright: uses the project's copy if installed, else a global one
// (`npm i -g playwright && npx playwright install chromium`).

import { createRequire } from 'node:module'
import { execSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import path from 'node:path'

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => {
    if (a.startsWith('--')) acc.push([a.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true])
    return acc
  }, []),
)
const url = args.url || 'http://localhost:5173'
const routes = String(args.routes || '/').split(',')
const out = path.resolve(args.out || 'ui-check')
const width = Number(args.width || 390)
mkdirSync(out, { recursive: true })

async function loadPlaywright() {
  try { return await import('playwright') } catch {}
  const root = execSync('npm root -g').toString().trim()
  return createRequire(path.join(root, 'noop.js'))('playwright')
}
const { chromium } = await loadPlaywright()

// Runs in the page: every visible text element, its color against the first
// non-transparent background behind it. WCAG: 4.5 normal text, 3 for >= 24px or >= 18.66px bold.
function contrastScan() {
  // Resolve any CSS color (rgb, oklch from Tailwind v4, color-mix...) to [r, g, b, a] via a 1px canvas.
  const cv = document.createElement('canvas'); cv.width = cv.height = 1
  const cx = cv.getContext('2d', { willReadFrequently: true })
  const parse = c => {
    cx.clearRect(0, 0, 1, 1); cx.fillStyle = '#000'; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1)
    const [r, g, b, a] = cx.getImageData(0, 0, 1, 1).data
    return [r, g, b, a / 255]
  }
  const lum = ([r, g, b]) => {
    const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
  }
  const bgOf = el => {
    for (let e = el; e; e = e.parentElement) {
      const c = parse(getComputedStyle(e).backgroundColor)
      if (c.length >= 3 && (c[3] === undefined || c[3] > 0.5)) return c
    }
    return [255, 255, 255]
  }
  const fails = []
  let checked = 0
  const dimmed = []
  for (const el of document.querySelectorAll('body *')) {
    const own = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())
    const r = el.getBoundingClientRect()
    const st = getComputedStyle(el)
    if (!own || !r.width || !r.height || st.visibility === 'hidden' || Number(st.opacity) === 0) continue
    checked++
    const fg = parse(st.color)
    const alpha = fg[3] === undefined ? 1 : fg[3]
    const bg = bgOf(el)
    const mixed = fg.slice(0, 3).map((v, i) => v * alpha + bg[i] * (1 - alpha))
    // opacity on ancestors fades text too
    let op = 1
    for (let e = el; e; e = e.parentElement) op *= Number(getComputedStyle(e).opacity)
    const shown = mixed.map((v, i) => v * op + bg[i] * (1 - op))
    const [a, b] = [lum(shown), lum(bg.slice(0, 3))]
    const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
    const size = parseFloat(st.fontSize)
    const large = size >= 24 || (size >= 18.66 && Number(st.fontWeight) >= 700)
    const need = large ? 3 : 4.5
    // Text faded with opacity is often inactive UI (other choices after answering), which WCAG
    // exempts, but it can also be a muted label people must read: warn instead of failing.
    if (ratio < need && op < 0.7) { dimmed.push(`"${el.textContent.trim().slice(0, 30)}" ${ratio.toFixed(2)}:1`); continue }
    if (ratio < need) fails.push(`"${el.textContent.trim().slice(0, 30)}" ${ratio.toFixed(2)}:1 (need ${need})`)
  }
  return { checked, dimmed, fails }
}

const browser = await chromium.launch()
const rows = []
let failed = false

for (const route of routes) {
  for (const mode of ['light', 'dark']) {
    const ctx = await browser.newContext({ viewport: { width, height: 844 }, colorScheme: mode })
    const page = await ctx.newPage()
    const errors = []
    page.on('pageerror', e => errors.push(e.message))
    await page.goto(url + route, { waitUntil: 'networkidle' })
    if (args['dark-class']) await page.evaluate(m => document.documentElement.classList.toggle('dark', m === 'dark'), mode)
    if (args.click && (await page.locator(String(args.click)).count())) await page.locator(String(args.click)).first().click()
    await page.waitForTimeout(900)
    const name = `${route.replace(/\W+/g, '_') || 'root'}-${mode}.png`
    await page.screenshot({ path: path.join(out, name), fullPage: true })
    const { checked, dimmed, fails } = await page.evaluate(contrastScan)
    const ok = !fails.length && !errors.length
    failed ||= !ok
    rows.push(`| ${route} | ${mode} | ${ok ? 'pass' : 'FAIL'} | ${checked} texts checked${dimmed.length ? `; check if inactive (faded): ${dimmed.slice(0, 3).join('; ')}` : ''}${fails.length ? '; low contrast: ' + fails.slice(0, 3).join('; ') : ''}${errors.length ? '; errors: ' + errors.slice(0, 2).join('; ') : ''} | ${name} |`)
    await ctx.close()
  }

  const ctx = await browser.newContext({ viewport: { width, height: 844 }, reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  await page.goto(url + route, { waitUntil: 'networkidle' })
  if (args.click && (await page.locator(String(args.click)).count())) await page.locator(String(args.click)).first().click()
  await page.waitForTimeout(900)
  const rm = await page.evaluate(() => ({
    infinite: document.getAnimations().filter(a => a.effect?.getTiming().iterations === Infinity).length,
    canvases: document.querySelectorAll('canvas').length,
  }))
  const ok = rm.infinite === 0 && rm.canvases === 0
  failed ||= !ok
  rows.push(`| ${route} | reduced motion | ${ok ? 'pass' : 'FAIL'} | ${rm.infinite} infinite animations, ${rm.canvases} confetti canvases | |`)
  await ctx.close()
}

await browser.close()
console.log('| Route | Mode | Result | Details | Screenshot |\n|---|---|---|---|---|\n' + rows.join('\n'))
console.log(`\nScreenshots: ${out}`)
process.exit(failed ? 1 : 0)
