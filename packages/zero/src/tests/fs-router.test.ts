import { describe, it, expect } from "vitest"
import { parseFileRoutes, filePathToUrlPath, generateRouteModule } from "../fs-router"

// ─── filePathToUrlPath ───────────────────────────────────────────────────────

describe("filePathToUrlPath", () => {
  it("maps index to /", () => {
    expect(filePathToUrlPath("index")).toBe("/")
  })

  it("maps static route", () => {
    expect(filePathToUrlPath("about")).toBe("/about")
  })

  it("maps nested index", () => {
    expect(filePathToUrlPath("users/index")).toBe("/users")
  })

  it("maps dynamic param", () => {
    expect(filePathToUrlPath("users/[id]")).toBe("/users/:id")
  })

  it("maps nested dynamic route", () => {
    expect(filePathToUrlPath("users/[id]/settings")).toBe("/users/:id/settings")
  })

  it("maps catch-all", () => {
    expect(filePathToUrlPath("blog/[...slug]")).toBe("/blog/:slug*")
  })

  it("strips route groups", () => {
    expect(filePathToUrlPath("(auth)/login")).toBe("/login")
  })

  it("strips nested route groups", () => {
    expect(filePathToUrlPath("(marketing)/features/pricing")).toBe("/features/pricing")
  })

  it("strips _layout", () => {
    expect(filePathToUrlPath("_layout")).toBe("/")
  })

  it("strips _error", () => {
    expect(filePathToUrlPath("_error")).toBe("/")
  })

  it("strips _loading", () => {
    expect(filePathToUrlPath("_loading")).toBe("/")
  })

  it("strips nested _layout", () => {
    expect(filePathToUrlPath("dashboard/_layout")).toBe("/dashboard")
  })
})

// ─── parseFileRoutes ─────────────────────────────────────────────────────────

describe("parseFileRoutes", () => {
  it("parses basic routes", () => {
    const routes = parseFileRoutes(["index.tsx", "about.tsx"])
    expect(routes).toHaveLength(2)
    expect(routes[0]!.urlPath).toBe("/")
    expect(routes[1]!.urlPath).toBe("/about")
  })

  it("filters non-route files", () => {
    const routes = parseFileRoutes(["index.tsx", "README.md", "styles.css"])
    expect(routes).toHaveLength(1)
  })

  it("identifies layouts", () => {
    const routes = parseFileRoutes(["_layout.tsx", "index.tsx"])
    const layout = routes.find((r) => r.isLayout)
    expect(layout).toBeDefined()
    expect(layout!.filePath).toBe("_layout.tsx")
  })

  it("identifies error boundaries", () => {
    const routes = parseFileRoutes(["_error.tsx", "index.tsx"])
    const error = routes.find((r) => r.isError)
    expect(error).toBeDefined()
  })

  it("identifies loading fallbacks", () => {
    const routes = parseFileRoutes(["_loading.tsx", "index.tsx"])
    const loading = routes.find((r) => r.isLoading)
    expect(loading).toBeDefined()
  })

  it("identifies catch-all routes", () => {
    const routes = parseFileRoutes(["blog/[...slug].tsx"])
    expect(routes[0]!.isCatchAll).toBe(true)
  })

  it("sorts static before dynamic", () => {
    const routes = parseFileRoutes(["[id].tsx", "about.tsx"])
    expect(routes[0]!.urlPath).toBe("/about")
    expect(routes[1]!.urlPath).toBe("/:id")
  })

  it("sorts catch-all last", () => {
    const routes = parseFileRoutes(["[...all].tsx", "about.tsx", "[id].tsx"])
    expect(routes[routes.length - 1]!.isCatchAll).toBe(true)
  })

  it("sorts layouts first at same depth", () => {
    const routes = parseFileRoutes(["index.tsx", "_layout.tsx"])
    expect(routes[0]!.isLayout).toBe(true)
  })

  it("computes dirPath correctly", () => {
    const routes = parseFileRoutes(["users/[id].tsx", "users/_layout.tsx"])
    for (const r of routes) {
      expect(r.dirPath).toBe("users")
    }
  })

  it("strips groups from dirPath", () => {
    const routes = parseFileRoutes(["(auth)/login.tsx"])
    expect(routes[0]!.dirPath).toBe("")
  })

  it("uses default renderMode", () => {
    const routes = parseFileRoutes(["index.tsx"], "ssg")
    expect(routes[0]!.renderMode).toBe("ssg")
  })
})

// ─── generateRouteModule ─────────────────────────────────────────────────────

describe("generateRouteModule", () => {
  it("generates valid module code", () => {
    const code = generateRouteModule(["index.tsx", "about.tsx"], "/src/routes")
    expect(code).toContain("import { lazy } from \"@pyreon/router\"")
    expect(code).toContain("export const routes")
    expect(code).toContain('path: "/"')
    expect(code).toContain('path: "/about"')
  })

  it("imports route modules for loader/guard/meta access", () => {
    const code = generateRouteModule(["index.tsx"], "/src/routes")
    // Should have module import for accessing loader, guard, meta
    expect(code).toContain("import * as")
  })

  it("uses lazy() for code splitting", () => {
    const code = generateRouteModule(["index.tsx"], "/src/routes")
    expect(code).toContain("lazy(() => import(")
  })

  it("wires up loader from module", () => {
    const code = generateRouteModule(["index.tsx"], "/src/routes")
    expect(code).toContain(".loader")
  })

  it("wires up guard as beforeEnter", () => {
    const code = generateRouteModule(["index.tsx"], "/src/routes")
    expect(code).toContain("beforeEnter:")
    expect(code).toContain(".guard")
  })

  it("wires up meta from module", () => {
    const code = generateRouteModule(["index.tsx"], "/src/routes")
    expect(code).toContain("meta:")
    expect(code).toContain(".meta")
  })

  it("wraps routes in layout when _layout exists", () => {
    const code = generateRouteModule(
      ["_layout.tsx", "index.tsx", "about.tsx"],
      "/src/routes",
    )
    expect(code).toContain("children:")
  })

  it("wires error component from _error.tsx", () => {
    const code = generateRouteModule(
      ["_error.tsx", "index.tsx"],
      "/src/routes",
    )
    expect(code).toContain("errorComponent:")
  })

  it("passes loading component to lazy()", () => {
    const code = generateRouteModule(
      ["_loading.tsx", "index.tsx"],
      "/src/routes",
    )
    // Loading component should be passed as option to lazy()
    expect(code).toContain("loading:")
  })

  it("handles nested directory routes", () => {
    const code = generateRouteModule(
      ["index.tsx", "users/index.tsx", "users/[id].tsx"],
      "/src/routes",
    )
    expect(code).toContain('path: "/"')
    expect(code).toContain('path: "/users"')
    expect(code).toContain('path: "/users/:id"')
  })

  it("handles nested layouts with children", () => {
    const code = generateRouteModule(
      ["_layout.tsx", "index.tsx", "dashboard/_layout.tsx", "dashboard/index.tsx", "dashboard/settings.tsx"],
      "/src/routes",
    )
    // Should have nested children structures
    expect(code).toContain("children:")
  })

  it("returns empty routes for empty file list", () => {
    const code = generateRouteModule([], "/src/routes")
    expect(code).toContain("export const routes")
  })

  it("includes clean() helper to strip undefined props", () => {
    const code = generateRouteModule(["index.tsx"], "/src/routes")
    expect(code).toContain("function clean(routes)")
  })
})
