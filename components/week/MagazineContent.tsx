import { Update, ThemeConfig } from "@/types"

type Props = {
  updates: Update[]
  weekTitle?: string
  theme?: ThemeConfig
}

const defaultTheme: ThemeConfig = {
  backgroundColor: "#f4f1ea",
  headerBg: "#f4f1ea",
  headerTextColor: "#111827",
  accentColor: "#4f46e5",
  accentBgColor: "#e0e7ff",
  bodyTextColor: "#111827",
  borderColor: "#1f2937",
  mentionColor: "#4f46e5",
  mentionBg: "#e0e7ff",
  fontFamily: "serif",
  imageFilter: "grayscale",
  dropCap: true,
  layout: "editorial",
  headerEmoji: "",
  tagline: "Editorial Edition",
}

const fontFamilyMap: Record<ThemeConfig["fontFamily"], string> = {
  serif: "Georgia, 'Times New Roman', serif",
  "sans-serif": "Inter, system-ui, -apple-system, sans-serif",
  monospace: "'Courier New', Courier, monospace",
}

const imageFilterMap: Record<ThemeConfig["imageFilter"], string> = {
  grayscale: "grayscale(100%)",
  sepia: "sepia(70%)",
  none: "none",
  saturate: "saturate(160%) brightness(1.05)",
}

function formatDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function renderMentions(text: string, color: string, bg: string) {
  return text.split(/(@\w+)/g).map((part, i) =>
    part.startsWith("@") ? (
      <span
        key={i}
        style={{ color, backgroundColor: bg }}
        className="font-semibold px-1 rounded inline-block"
      >
        {part}
      </span>
    ) : (
      part
    )
  )
}

export default function MagazineContent({ updates, weekTitle, theme: themeProp }: Props) {
  const t = { ...defaultTheme, ...themeProp }
  const fontFamily = fontFamilyMap[t.fontFamily]
  const imgFilter = imageFilterMap[t.imageFilter]

  // ── Article Component (reusable) ──
  const Article = ({ update, index, isHero = false }: { update: Update; index: number; isHero?: boolean }) => (
    <article
      className={`transition-colors duration-500 ${isHero ? "mb-16" : "pb-8"}`}
      style={{
        borderBottom: t.layout === "editorial" || t.layout === "modern" ? `1px solid ${t.borderColor}` : "none",
      }}
    >
      {/* Accent Bar */}
      {t.layout === "modern" && (
        <div className="w-10 h-1 mb-4 rounded-full" style={{ backgroundColor: t.accentColor }} />
      )}

      {/* Story Pill */}
      {(t.layout === "minimal" || t.layout === "magazine-spread") && (
        <div className="mb-3">
          <span
            className="text-[10px] uppercase tracking-[0.2em] px-2 py-0.5 rounded-full font-semibold"
            style={{ backgroundColor: t.accentBgColor, color: t.accentColor }}
          >
            Story {String(index + 1).padStart(2, "0")}
          </span>
        </div>
      )}

      {/* Headline */}
      <h2
        className={`${isHero ? "text-6xl" : "text-3xl"} font-bold leading-tight mb-4 transition-colors duration-500`}
        style={{ color: t.headerTextColor, fontFamily }}
      >
        {update.title}
      </h2>

      {/* Byline */}
      <div
        className="text-xs mb-6 flex justify-between items-center py-2"
        style={{
          borderTop: isHero ? `1px solid ${t.borderColor}` : "none",
          borderBottom: isHero ? `1px solid ${t.borderColor}` : "none",
          color: t.bodyTextColor,
          opacity: 0.7,
        }}
      >
        <span>
          By <span className="font-semibold">{update.submitted_by_name}</span>
        </span>
        {t.layout !== "minimal" && !isHero && (
          <span className="uppercase tracking-widest opacity-50">#{index + 1}</span>
        )}
      </div>

      {/* Image */}
      {update.image_url && (
        <figure className="mb-6 overflow-hidden rounded-sm">
          <img
            src={update.image_url}
            alt={update.title}
            className={`w-full ${isHero ? "h-[450px]" : "h-[200px]"} object-cover transition-all duration-500 hover:scale-105`}
            style={{ filter: imgFilter }}
          />
        </figure>
      )}

      {/* Body */}
      <div className={`${isHero ? "text-lg" : "text-sm"} leading-relaxed text-justify`}>
        <p
          className={
            t.dropCap && isHero
              ? "first-letter:text-8xl first-letter:font-bold first-letter:mr-3 first-letter:float-left first-letter:leading-none"
              : ""
          }
          style={{ color: t.bodyTextColor }}
        >
          {renderMentions(update.description, t.mentionColor, t.mentionBg)}
        </p>
      </div>
    </article>
  )

  return (
    <div
      className="min-h-screen transition-colors duration-700"
      style={{ backgroundColor: t.backgroundColor, color: t.bodyTextColor, fontFamily }}
    >
      {/* ── Header ── */}
      <header
        className="text-center pt-12 pb-8 transition-all duration-500"
        style={{ backgroundColor: t.headerBg, borderBottom: `2px solid ${t.borderColor}` }}
      >
        {t.headerEmoji && <div className="text-6xl mb-4 animate-pulse">{t.headerEmoji}</div>}
        <h1 className="text-7xl font-black tracking-tighter uppercase px-4" style={{ color: t.headerTextColor }}>
          {weekTitle || "The Weekly Journal"}
        </h1>
        <p className="mt-4 text-[10px] tracking-[0.4em] uppercase opacity-60" style={{ color: t.headerTextColor }}>
          {formatDate()} • {t.tagline}
        </p>
      </header>

      {/* ── Dynamic Layout Engine ── */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        
        {/* 1. HERO GRID: Giant first post, then 2-col grid */}
        {t.layout === "hero-grid" ? (
          <div>
            {updates.length > 0 && <Article update={updates[0]} index={0} isHero={true} />}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {updates.slice(1).map((u, i) => (
                <Article key={u.id} update={u} index={i + 1} />
              ))}
            </div>
          </div>
        ) 
        
        // 2. MAGAZINE SPREAD: 3-column dense layout
        : t.layout === "magazine-spread" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {updates.map((u, i) => (
              <Article key={u.id} update={u} index={i} />
            ))}
          </div>
        )

        // 3. DEFAULT/EDITORIAL: Single column vertical list
        : (
          <div className="space-y-16 max-w-3xl mx-auto">
            {updates.map((u, i) => (
              <Article key={u.id} update={u} index={i} isHero={i === 0 && t.layout === "editorial"} />
            ))}
          </div>
        )}

      </main>
    </div>
  )
}