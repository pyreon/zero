import { describe, it, expect } from "vitest"

// Test the cache middleware logic by simulating requests/responses
// The middleware depends on @pyreon/server types, so we test the pattern matching
// and header logic directly.

describe("cache header logic", () => {
  const HASHED_ASSET = /\.[a-f0-9]{8,}\.\w+$/
  const STATIC_EXT = /\.(png|jpe?g|gif|svg|webp|avif|ico|woff2?|ttf|otf|eot|mp4|webm|ogg|mp3|wav)$/i
  const SCRIPT_EXT = /\.(js|css|mjs)$/i

  it("detects hashed assets", () => {
    expect(HASHED_ASSET.test("/assets/app-a1b2c3d4.js")).toBe(true)
    expect(HASHED_ASSET.test("/assets/style-deadbeef01.css")).toBe(true)
    expect(HASHED_ASSET.test("/assets/app.js")).toBe(false)
    expect(HASHED_ASSET.test("/index.html")).toBe(false)
  })

  it("detects static assets", () => {
    expect(STATIC_EXT.test("/img/hero.png")).toBe(true)
    expect(STATIC_EXT.test("/fonts/inter.woff2")).toBe(true)
    expect(STATIC_EXT.test("/video.mp4")).toBe(true)
    expect(STATIC_EXT.test("/favicon.ico")).toBe(true)
    expect(STATIC_EXT.test("/app.js")).toBe(false)
    expect(STATIC_EXT.test("/index.html")).toBe(false)
  })

  it("detects script assets", () => {
    expect(SCRIPT_EXT.test("/app.js")).toBe(true)
    expect(SCRIPT_EXT.test("/style.css")).toBe(true)
    expect(SCRIPT_EXT.test("/module.mjs")).toBe(true)
    expect(SCRIPT_EXT.test("/image.png")).toBe(false)
  })

  function matchGlob(pattern: string, path: string): boolean {
    const regex = pattern.replace(/\*/g, ".*").replace(/\?/g, ".")
    return new RegExp(`^${regex}$`).test(path)
  }

  it("matches glob patterns", () => {
    expect(matchGlob("/api/*", "/api/users")).toBe(true)
    expect(matchGlob("/api/*", "/api/users/123")).toBe(true)
    expect(matchGlob("/api/*", "/about")).toBe(false)
    expect(matchGlob("/assets/*", "/assets/img/hero.png")).toBe(true)
  })

  it("determines correct cache strategy", () => {
    function getCacheStrategy(path: string): string {
      if (HASHED_ASSET.test(path)) return "immutable"
      if (SCRIPT_EXT.test(path)) return "short-cache"
      if (STATIC_EXT.test(path)) return "long-cache"
      return "no-cache"
    }

    expect(getCacheStrategy("/assets/app-a1b2c3d4.js")).toBe("immutable")
    expect(getCacheStrategy("/assets/style.css")).toBe("short-cache")
    expect(getCacheStrategy("/img/hero.webp")).toBe("long-cache")
    expect(getCacheStrategy("/")).toBe("no-cache")
    expect(getCacheStrategy("/about")).toBe("no-cache")
  })
})
