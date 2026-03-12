import { signal, computed, onMount, onCleanup } from "@pyreon/reactivity"

// ─── Image optimization component ───────────────────────────────────────────
//
// <Image> provides:
// - Lazy loading via IntersectionObserver (loads when near viewport)
// - Automatic width/height to prevent CLS (Cumulative Layout Shift)
// - Responsive srcset generation from width descriptors
// - Blur-up placeholder while loading
// - Format negotiation hints (WebP/AVIF)
// - Priority loading for above-the-fold images

export interface ImageProps {
  /** Image source URL. */
  src: string
  /** Alt text (required for accessibility). */
  alt: string
  /** Intrinsic width of the image. */
  width: number
  /** Intrinsic height of the image. */
  height: number
  /** Responsive sizes attribute. e.g. "(max-width: 768px) 100vw, 50vw" */
  sizes?: string
  /** Responsive srcset. e.g. [{ src: "/img-400.jpg", width: 400 }, ...] */
  srcset?: ImageSource[]
  /** Loading strategy. "lazy" uses IntersectionObserver, "eager" loads immediately. Default: "lazy" */
  loading?: "lazy" | "eager"
  /** Mark as priority (LCP image). Disables lazy loading, adds fetchpriority="high". */
  priority?: boolean
  /** Low-quality placeholder image URL or base64 data URI for blur-up effect. */
  placeholder?: string
  /** CSS class name. */
  class?: string
  /** Inline styles. */
  style?: string
  /** CSS object-fit. Default: "cover" */
  fit?: "cover" | "contain" | "fill" | "none" | "scale-down"
  /** Decode async. Default: true */
  decoding?: "sync" | "async" | "auto"
}

export interface ImageSource {
  src: string
  width: number
}

/**
 * Optimized image component with lazy loading, responsive images,
 * and blur-up placeholder support.
 *
 * @example
 * import { Image } from "@pyreon/zero/image"
 *
 * <Image
 *   src="/hero.jpg"
 *   alt="Hero image"
 *   width={1200}
 *   height={630}
 *   priority
 *   placeholder="/hero-blur.jpg"
 *   sizes="100vw"
 *   srcset={[
 *     { src: "/hero-640.jpg", width: 640 },
 *     { src: "/hero-1200.jpg", width: 1200 },
 *     { src: "/hero-1920.jpg", width: 1920 },
 *   ]}
 * />
 */
export function Image(props: ImageProps) {
  const isEager = props.priority || props.loading === "eager"
  const loaded = signal(isEager)
  const inView = signal(isEager)
  let imgRef: HTMLImageElement | undefined

  const srcsetStr = computed(() => {
    if (!props.srcset?.length) return undefined
    return props.srcset.map((s) => `${s.src} ${s.width}w`).join(", ")
  })

  const currentSrc = computed(() => {
    return inView() ? props.src : undefined
  })

  const currentSrcset = computed(() => {
    return inView() ? srcsetStr() : undefined
  })

  const showPlaceholder = computed(() => {
    return !!props.placeholder && !loaded()
  })

  const aspectRatio = `${props.width} / ${props.height}`

  onMount(() => {
    if (isEager || !imgRef) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            inView(true)
            observer.disconnect()
          }
        }
      },
      { rootMargin: "200px" },
    )

    observer.observe(imgRef)

    onCleanup(() => observer.disconnect())
  })

  function onLoad() {
    loaded(true)
  }

  const containerStyle = [
    "position: relative",
    "overflow: hidden",
    `aspect-ratio: ${aspectRatio}`,
    `max-width: ${props.width}px`,
    "width: 100%",
    props.style,
  ]
    .filter(Boolean)
    .join("; ")

  const imgStyle = [
    "display: block",
    "width: 100%",
    "height: 100%",
    `object-fit: ${props.fit ?? "cover"}`,
    `transition: opacity 0.3s ease`,
    showPlaceholder() ? "opacity: 0" : "opacity: 1",
  ].join("; ")

  const placeholderStyle = [
    "position: absolute",
    "inset: 0",
    "width: 100%",
    "height: 100%",
    "object-fit: cover",
    "filter: blur(20px)",
    "transform: scale(1.1)",
    `transition: opacity 0.4s ease`,
    loaded() ? "opacity: 0; pointer-events: none" : "opacity: 1",
  ].join("; ")

  return (
    <div class={props.class} style={containerStyle}>
      {props.placeholder && (
        <img
          src={props.placeholder}
          alt=""
          aria-hidden="true"
          style={placeholderStyle}
        />
      )}
      <img
        ref={(el: HTMLImageElement) => { imgRef = el }}
        src={currentSrc()}
        srcset={currentSrcset()}
        sizes={props.sizes}
        alt={props.alt}
        width={props.width}
        height={props.height}
        loading={isEager ? "eager" : "lazy"}
        decoding={props.decoding ?? "async"}
        fetchpriority={props.priority ? "high" : undefined}
        onload={onLoad}
        style={imgStyle}
      />
    </div>
  )
}
