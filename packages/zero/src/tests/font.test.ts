import { describe, it, expect } from "vitest"
import { parseGoogleFamily, googleFontsUrl, fontVariables } from "../font"

describe("parseGoogleFamily", () => {
  it("parses family with weights", () => {
    const result = parseGoogleFamily("Inter:wght@400;500;700")
    expect(result.family).toBe("Inter")
    expect(result.weights).toEqual(["400", "500", "700"])
    expect(result.italic).toBe(false)
  })

  it("parses family without weight spec", () => {
    const result = parseGoogleFamily("Roboto")
    expect(result.family).toBe("Roboto")
    expect(result.weights).toEqual(["400"])
  })

  it("parses family with italic", () => {
    const result = parseGoogleFamily("Lora:ital,wght@400;700")
    expect(result.family).toBe("Lora")
    expect(result.weights).toEqual(["400", "700"])
    expect(result.italic).toBe(true)
  })

  it("trims whitespace from family name", () => {
    const result = parseGoogleFamily("  Open Sans :wght@300")
    expect(result.family).toBe("Open Sans")
    expect(result.weights).toEqual(["300"])
  })
})

describe("googleFontsUrl", () => {
  it("generates correct URL for single family", () => {
    const url = googleFontsUrl([
      { family: "Inter", weights: ["400", "700"], italic: false },
    ])
    expect(url).toContain("fonts.googleapis.com/css2")
    expect(url).toContain("family=Inter:wght@400;700")
    expect(url).toContain("display=swap")
  })

  it("generates correct URL for multiple families", () => {
    const url = googleFontsUrl([
      { family: "Inter", weights: ["400"], italic: false },
      { family: "JetBrains Mono", weights: ["400"], italic: false },
    ])
    expect(url).toContain("family=Inter:wght@400")
    expect(url).toContain("family=JetBrains+Mono:wght@400")
  })

  it("handles italic families", () => {
    const url = googleFontsUrl([
      { family: "Lora", weights: ["400", "700"], italic: true },
    ])
    expect(url).toContain("family=Lora:ital,wght@0,400;1,400;0,700;1,700")
  })

  it("uses custom display value", () => {
    const url = googleFontsUrl(
      [{ family: "Inter", weights: ["400"], italic: false }],
      "optional",
    )
    expect(url).toContain("display=optional")
  })
})

describe("fontVariables", () => {
  it("generates CSS variables", () => {
    const css = fontVariables({
      sans: '"Inter", system-ui, sans-serif',
      mono: '"JetBrains Mono", monospace',
    })
    expect(css).toContain(":root {")
    expect(css).toContain('--font-sans: "Inter", system-ui, sans-serif;')
    expect(css).toContain('--font-mono: "JetBrains Mono", monospace;')
    expect(css).toContain("}")
  })
})
