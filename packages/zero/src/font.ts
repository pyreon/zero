import type { Plugin } from "vite"

// ─── Font optimization ──────────────────────────────────────────────────────
//
// Zero provides automatic font optimization:
// - Downloads and self-hosts Google Fonts at build time (privacy + performance)
// - Falls back to CDN link in dev mode (for fast dev startup)
// - Injects preconnect/preload hints into the HTML
// - Sets font-display: swap to prevent FOIT (Flash of Invisible Text)
// - Generates optimized @font-face declarations
// - Size-adjusted fallback fonts to reduce CLS

export interface FontConfig {
  /** Google Fonts families. Static: "Inter:wght@400;500;700", Variable: "Inter:wght@100..900" */
  google?: string[]
  /** Local font files. */
  local?: LocalFont[]
  /** Default font-display strategy. Default: "swap" */
  display?: FontDisplay
  /** Preload critical fonts. Default: true */
  preload?: boolean
  /** Self-host Google Fonts at build time. Default: true */
  selfHost?: boolean
  /** Fallback font metrics for reducing CLS. */
  fallbacks?: Record<string, FallbackMetrics>
}

export interface LocalFont {
  family: string
  src: string
  /** Single weight (400) or variable range ("100 900"). */
  weight?: string | number
  style?: "normal" | "italic"
  display?: FontDisplay
}

export type FontDisplay = "auto" | "block" | "swap" | "fallback" | "optional"

/** Metrics for generating size-adjusted fallback fonts to reduce CLS. */
export interface FallbackMetrics {
  /** The fallback font to adjust. e.g. "Arial", "Georgia" */
  fallback: string
  /** Size adjustment factor. e.g. 1.05 */
  sizeAdjust?: number
  /** Ascent override percentage. e.g. 90 */
  ascentOverride?: number
  /** Descent override percentage. e.g. 22 */
  descentOverride?: number
  /** Line gap override percentage. e.g. 0 */
  lineGapOverride?: number
}

interface ResolvedFont {
  family: string
  weights: string[]
  italic: boolean
  /** Whether this is a variable font with a weight range (e.g. 100..900). */
  variable: boolean
  /** Weight range for variable fonts. e.g. "100..900" */
  weightRange?: string
}

/**
 * Parse Google Fonts family string.
 *
 * Static weights: "Inter:wght@400;500;700"
 * Variable range:  "Inter:wght@100..900"
 * Variable with italic: "Inter:ital,wght@100..900"
 */
export function parseGoogleFamily(input: string): ResolvedFont {
  const [familyPart, spec] = input.split(":")
  const family = familyPart!.trim()
  const weights: string[] = []
  let italic = false
  let variable = false
  let weightRange: string | undefined

  if (spec) {
    // Check for variable font range syntax: wght@100..900
    const rangeMatch = spec.match(/wght@(\d+)\.\.(\d+)/)
    if (rangeMatch) {
      variable = true
      weightRange = `${rangeMatch[1]}..${rangeMatch[2]}`
      weights.push(weightRange)
    } else {
      const weightMatch = spec.match(/wght@([\d;]+)/)
      if (weightMatch) {
        weights.push(...weightMatch[1]!.split(";"))
      }
    }
    italic = spec.includes("ital")
  }

  if (weights.length === 0) weights.push("400")

  return { family, weights, italic, variable, weightRange }
}

/**
 * Generate a Google Fonts CSS URL.
 */
export function googleFontsUrl(families: ResolvedFont[], display: FontDisplay = "swap"): string {
  const params = families
    .map((f) => {
      const axes = f.italic ? "ital,wght" : "wght"

      if (f.variable && f.weightRange) {
        // Variable font: use range syntax
        // ital,wght@0,100..900;1,100..900 or wght@100..900
        const range = f.italic
          ? `0,${f.weightRange};1,${f.weightRange}`
          : f.weightRange
        return `family=${f.family.replace(/ /g, "+")}:${axes}@${range}`
      }

      // Static font: list individual weights
      const values = f.weights
        .map((w) => (f.italic ? `0,${w};1,${w}` : w))
        .join(";")
      return `family=${f.family.replace(/ /g, "+")}:${axes}@${values}`
    })
    .join("&")

  return `https://fonts.googleapis.com/css2?${params}&display=${display}`
}

/**
 * Generate @font-face CSS for local fonts.
 */
function localFontFaces(fonts: LocalFont[], display: FontDisplay): string {
  return fonts
    .map(
      (f) => `@font-face {
  font-family: "${f.family}";
  src: url("${f.src}");
  font-weight: ${f.weight ?? "400"};
  font-style: ${f.style ?? "normal"};
  font-display: ${f.display ?? display};
}`,
    )
    .join("\n\n")
}

/**
 * Generate size-adjusted fallback @font-face declarations to reduce CLS.
 */
function fallbackFontFaces(fallbacks: Record<string, FallbackMetrics>): string {
  return Object.entries(fallbacks)
    .map(([family, metrics]) => {
      const overrides: string[] = []
      if (metrics.sizeAdjust != null)
        overrides.push(`  size-adjust: ${metrics.sizeAdjust * 100}%;`)
      if (metrics.ascentOverride != null)
        overrides.push(`  ascent-override: ${metrics.ascentOverride}%;`)
      if (metrics.descentOverride != null)
        overrides.push(`  descent-override: ${metrics.descentOverride}%;`)
      if (metrics.lineGapOverride != null)
        overrides.push(`  line-gap-override: ${metrics.lineGapOverride}%;`)

      return `@font-face {
  font-family: "${family} Fallback";
  src: local("${metrics.fallback}");
${overrides.join("\n")}
}`
    })
    .join("\n\n")
}

/**
 * Generate preload link tags for critical font files.
 */
function preloadTags(fonts: LocalFont[]): string {
  return fonts
    .map((f) => {
      const ext = f.src.split(".").pop()
      const type =
        ext === "woff2"
          ? "font/woff2"
          : ext === "woff"
            ? "font/woff"
            : ext === "ttf"
              ? "font/ttf"
              : "font/otf"
      return `<link rel="preload" href="${f.src}" as="font" type="${type}" crossorigin>`
    })
    .join("\n")
}

/**
 * Download Google Fonts CSS with woff2 user agent.
 */
async function downloadGoogleFontsCSS(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch Google Fonts CSS: ${response.status}`)
  }
  return response.text()
}

/**
 * Download a font file.
 */
async function downloadFontFile(url: string): Promise<Buffer> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to download font: ${url}`)
  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

/**
 * Extract font file URLs from Google Fonts CSS.
 */
function extractFontUrls(css: string): string[] {
  const urls: string[] = []
  const regex = /url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g
  let match
  while ((match = regex.exec(css)) !== null) {
    urls.push(match[1]!)
  }
  return urls
}

/**
 * Self-host Google Fonts: download CSS + font files, rewrite URLs to local paths.
 */
async function selfHostFonts(
  cssUrl: string,
  fontsSubDir: string,
): Promise<{ css: string; fontFiles: Array<{ name: string; content: Buffer }> }> {
  const css = await downloadGoogleFontsCSS(cssUrl)
  const fontUrls = extractFontUrls(css)
  const fontFiles: Array<{ name: string; content: Buffer }> = []

  let rewrittenCss = css

  for (const url of fontUrls) {
    const urlParts = url.split("/")
    const fileName = urlParts[urlParts.length - 1]!.split("?")[0]!
    const content = await downloadFontFile(url)

    fontFiles.push({ name: fileName, content })
    rewrittenCss = rewrittenCss.replace(url, `/${fontsSubDir}/${fileName}`)
  }

  return { css: rewrittenCss, fontFiles }
}

/**
 * Zero font optimization Vite plugin.
 *
 * Dev mode: injects Google Fonts CDN link for fast startup.
 * Build mode: downloads and self-hosts fonts for maximum performance + privacy.
 *
 * @example
 * import { fontPlugin } from "@pyreon/zero/font"
 *
 * export default {
 *   plugins: [
 *     pyreon(),
 *     zero(),
 *     fontPlugin({
 *       google: ["Inter:wght@400;500;600;700", "JetBrains Mono:wght@400"],
 *       fallbacks: {
 *         "Inter": { fallback: "Arial", sizeAdjust: 1.07, ascentOverride: 90 },
 *       },
 *     }),
 *   ],
 * }
 */
export function fontPlugin(config: FontConfig = {}): Plugin {
  const display = config.display ?? "swap"
  const shouldPreload = config.preload !== false
  const shouldSelfHost = config.selfHost !== false
  const googleFamilies = (config.google ?? []).map(parseGoogleFamily)

  let isBuild = false
  let selfHostedCSS = ""
  let selfHostedFontFiles: Array<{ name: string; content: Buffer }> = []

  return {
    name: "pyreon-zero-fonts",

    configResolved(resolvedConfig) {
      isBuild = resolvedConfig.command === "build"
    },

    async buildStart() {
      if (isBuild && shouldSelfHost && googleFamilies.length > 0) {
        const cssUrl = googleFontsUrl(googleFamilies, display)
        try {
          const result = await selfHostFonts(cssUrl, "assets/fonts")
          selfHostedCSS = result.css
          selfHostedFontFiles = result.fontFiles
        } catch (err) {
          console.warn("[zero-fonts] Failed to self-host fonts, falling back to CDN:", err)
        }
      }
    },

    generateBundle() {
      // Emit self-hosted font files as assets
      for (const file of selfHostedFontFiles) {
        this.emitFile({
          type: "asset",
          fileName: `assets/fonts/${file.name}`,
          source: file.content,
        })
      }
    },

    transformIndexHtml(html) {
      const tags: string[] = []

      if (isBuild && selfHostedCSS) {
        // Build: inline self-hosted font CSS
        tags.push(`<style>${selfHostedCSS}</style>`)

        // Preload first font file per family
        if (shouldPreload) {
          const preloadFiles = selfHostedFontFiles.slice(0, googleFamilies.length)
          for (const file of preloadFiles) {
            const ext = file.name.split(".").pop()
            const type = ext === "woff2" ? "font/woff2" : "font/woff"
            tags.push(
              `<link rel="preload" href="/assets/fonts/${file.name}" as="font" type="${type}" crossorigin>`,
            )
          }
        }
      } else if (googleFamilies.length > 0) {
        // Dev: CDN for fast startup
        const cssUrl = googleFontsUrl(googleFamilies, display)
        tags.push(`<link rel="preconnect" href="https://fonts.googleapis.com">`)
        tags.push(`<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`)
        tags.push(`<link rel="stylesheet" href="${cssUrl}">`)
      }

      // Local font preloads
      if (shouldPreload && config.local?.length) {
        tags.push(preloadTags(config.local))
      }

      // Local font @font-face
      if (config.local?.length) {
        tags.push(`<style>${localFontFaces(config.local, display)}</style>`)
      }

      // Fallback font metrics (CLS reduction)
      if (config.fallbacks && Object.keys(config.fallbacks).length > 0) {
        tags.push(`<style>${fallbackFontFaces(config.fallbacks)}</style>`)
      }

      if (tags.length > 0) {
        return html.replace("</head>", `${tags.join("\n")}\n</head>`)
      }

      return html
    },
  }
}

/**
 * Generate CSS variables for font families.
 */
export function fontVariables(
  families: Record<string, string>,
): string {
  const vars = Object.entries(families)
    .map(([key, value]) => `  --font-${key}: ${value};`)
    .join("\n")
  return `:root {\n${vars}\n}`
}
