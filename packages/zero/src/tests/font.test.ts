import { describe, it, expect } from "vitest"
import { parseGoogleFamily, googleFontsUrl, fontVariables } from "../font"

describe("parseGoogleFamily", () => {
  it("parses family with weights", () => {
    const result = parseGoogleFamily("Inter:wght@400;500;700")
    expect(result.family).toBe("Inter")
    expect(result.weights).toEqual(["400", "500", "700"])
    expect(result.italic).toBe(false)
    expect(result.variable).toBe(false)
  })

  it("parses family without weight spec", () => {
    const result = parseGoogleFamily("Roboto")
    expect(result.family).toBe("Roboto")
    expect(result.weights).toEqual(["400"])
    expect(result.variable).toBe(false)
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

  it("parses variable font with weight range", () => {
    const result = parseGoogleFamily("Inter:wght@100..900")
    expect(result.family).toBe("Inter")
    expect(result.variable).toBe(true)
    expect(result.weightRange).toBe("100..900")
    expect(result.weights).toEqual(["100..900"])
  })

  it("parses variable font with italic", () => {
    const result = parseGoogleFamily("Inter:ital,wght@100..900")
    expect(result.family).toBe("Inter")
    expect(result.variable).toBe(true)
    expect(result.italic).toBe(true)
    expect(result.weightRange).toBe("100..900")
  })

  it("parses variable font with partial range", () => {
    const result = parseGoogleFamily("Roboto Flex:wght@400..700")
    expect(result.family).toBe("Roboto Flex")
    expect(result.variable).toBe(true)
    expect(result.weightRange).toBe("400..700")
  })
})

describe("googleFontsUrl", () => {
  it("generates correct URL for single family", () => {
    const url = googleFontsUrl([
      { family: "Inter", weights: ["400", "700"], italic: false, variable: false },
    ])
    expect(url).toContain("fonts.googleapis.com/css2")
    expect(url).toContain("family=Inter:wght@400;700")
    expect(url).toContain("display=swap")
  })

  it("generates correct URL for multiple families", () => {
    const url = googleFontsUrl([
      { family: "Inter", weights: ["400"], italic: false, variable: false },
      { family: "JetBrains Mono", weights: ["400"], italic: false, variable: false },
    ])
    expect(url).toContain("family=Inter:wght@400")
    expect(url).toContain("family=JetBrains+Mono:wght@400")
  })

  it("handles italic families", () => {
    const url = googleFontsUrl([
      { family: "Lora", weights: ["400", "700"], italic: true, variable: false },
    ])
    expect(url).toContain("family=Lora:ital,wght@0,400;1,400;0,700;1,700")
  })

  it("uses custom display value", () => {
    const url = googleFontsUrl(
      [{ family: "Inter", weights: ["400"], italic: false, variable: false }],
      "optional",
    )
    expect(url).toContain("display=optional")
  })

  it("generates variable font URL with weight range", () => {
    const url = googleFontsUrl([
      { family: "Inter", weights: ["100..900"], italic: false, variable: true, weightRange: "100..900" },
    ])
    expect(url).toContain("family=Inter:wght@100..900")
  })

  it("generates variable font URL with italic and range", () => {
    const url = googleFontsUrl([
      { family: "Inter", weights: ["100..900"], italic: true, variable: true, weightRange: "100..900" },
    ])
    expect(url).toContain("family=Inter:ital,wght@0,100..900;1,100..900")
  })

  it("mixes static and variable families", () => {
    const url = googleFontsUrl([
      { family: "Inter", weights: ["100..900"], italic: false, variable: true, weightRange: "100..900" },
      { family: "JetBrains Mono", weights: ["400", "700"], italic: false, variable: false },
    ])
    expect(url).toContain("family=Inter:wght@100..900")
    expect(url).toContain("family=JetBrains+Mono:wght@400;700")
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
