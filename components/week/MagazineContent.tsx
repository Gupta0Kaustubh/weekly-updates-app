import { useProfiles } from "@/lib/hooks/useProfiles"
import { renderDescriptionWithMentions } from "@/lib/mentions"
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
  const { profiles } = useProfiles()


  const t = { ...defaultTheme, ...themeProp }
  const fontFamily = fontFamilyMap[t.fontFamily]
  const imgFilter = imageFilterMap[t.imageFilter]

  // Default fine-tuning variables if not provided by AI
  const aiStyles = {
    "--article-padding": "2rem",
    "--article-radius": "4px",
    "--header-size": "clamp(3rem, 10vw, 5rem)",
    "--tagline-tracking": "0.4em",
    "--grid-gap": "3rem",
    ...t.customStyles,
  } as React.CSSProperties

  // ── Article Component (reusable) ──
  const Article = ({ update, index, isHero = false }: { update: Update; index: number; isHero?: boolean }) => (
    <article
      className={`transition-all duration-500 ${isHero ? "mb-16" : "pb-8"}`}
      style={{
        borderBottom: t.layout === "editorial" || t.layout === "modern" ? `1px solid ${t.borderColor}` : "none",
        paddingBottom: "var(--article-padding)",
      }}
    >
      {/* Accent Bar */}
      {t.layout === "modern" && (
        <div className="w-10 h-1 mb-6 rounded-full" style={{ backgroundColor: t.accentColor }} />
      )}

      {/* Story Pill */}
      {(t.layout === "minimal" || t.layout === "magazine-spread") && (
        <div className="mb-4">
          <span
            className="text-[10px] uppercase tracking-[0.2em] px-3 py-1 rounded-full font-bold shadow-sm"
            style={{ backgroundColor: t.accentBgColor, color: t.accentColor }}
          >
            Edition {String(index + 1).padStart(2, "0")}
          </span>
        </div>
      )}

      {/* Headline */}
      <h2
        className={`${isHero ? "text-6xl md:text-7xl" : "text-3xl md:text-4xl"} font-bold leading-[1.1] mb-6 transition-colors duration-500 tracking-tight`}
        style={{ color: t.headerTextColor, fontFamily }}
      >
        {update.title}
      </h2>

      {/* Byline */}
      <div
        className="text-[11px] mb-8 flex justify-between items-center py-3 uppercase tracking-wider font-medium"
        style={{
          borderTop: isHero ? `1px solid ${t.borderColor}` : "none",
          borderBottom: isHero ? `1px solid ${t.borderColor}` : "none",
          color: t.bodyTextColor,
          opacity: 0.8,
        }}
      >
        <span>
          By <span className="font-bold">{update.submitted_by_name}</span>
        </span>
        {t.layout !== "minimal" && !isHero && (
          <span className="opacity-40">#{index + 1}</span>
        )}
      </div>

      {/* Image */}
      {update.image_url && (
        <figure
          className="mb-8 overflow-hidden transition-transform duration-700 hover:scale-[1.02]"
          style={{ borderRadius: "var(--article-radius)" }}
        >
          <img
            src={update.image_url}
            alt={update.title}
            className={`w-full ${isHero ? "h-[500px]" : "h-[250px]"} object-cover transition-all duration-700`}
            style={{ filter: imgFilter }}
          />
        </figure>
      )}

      {/* Body */}
      <div className={`${isHero ? "text-xl" : "text-base"} leading-relaxed text-justify`}>
        <p
          className={
            t.dropCap && isHero
              ? "first-letter:text-8xl first-letter:font-bold first-letter:mr-4 first-letter:float-left first-letter:leading-none first-letter:text-indigo-600"
              : ""
          }
          style={{ color: t.bodyTextColor }}
        >
          {renderDescriptionWithMentions(update.description, profiles, "font-semibold text-indigo-600 bg-indigo-100 px-1 rounded")}
        </p>
      </div>
    </article>
  )

  return (
    <div
      className="min-h-screen transition-all duration-700"
      style={{
        backgroundColor: t.backgroundColor,
        color: t.bodyTextColor,
        fontFamily,
        ...aiStyles
      }}
    >
      {/* ── Header ── */}
      <header
        className="text-center pt-20 pb-12 transition-all duration-700"
        style={{ backgroundColor: t.headerBg, borderBottom: `4px double ${t.borderColor}` }}
      >
        {t.headerEmoji && <div className="text-7xl mb-6 animate-bounce">{t.headerEmoji}</div>}
        <h1
          className="font-black tracking-tighter uppercase px-6 leading-none"
          style={{ color: t.headerTextColor, fontSize: "var(--header-size)" }}
        >
          {weekTitle || "The Weekly Journal"}
        </h1>
        <p
          className="mt-6 text-xs uppercase opacity-70 font-semibold"
          style={{ color: t.headerTextColor, letterSpacing: "var(--tagline-tracking)" }}
        >
          {formatDate()} • {t.tagline}
        </p>
      </header>

      {/* ── Dynamic Layout Engine ── */}
      <main
        className="max-w-7xl mx-auto px-6 md:px-16 py-16"
        style={{ gap: "var(--grid-gap)" }}
      >

        {/* 1. HERO GRID */}
        {t.layout === "hero-grid" ? (
          <div style={{ display: 'grid', gap: 'var(--grid-gap)' }}>
            {updates.length > 0 && <Article update={updates[0]} index={0} isHero={true} />}
            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--grid-gap)' }}>
              {updates.slice(1).map((u, i) => (
                <Article key={u.id} update={u} index={i + 1} />
              ))}
            </div>
          </div>
        )

          // 2. MAGAZINE SPREAD
          : t.layout === "magazine-spread" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: 'var(--grid-gap)' }}>
              {updates.map((u, i) => (
                <Article key={u.id} update={u} index={i} />
              ))}
            </div>
          )

            // 3. DEFAULT/EDITORIAL
            : (
              <div className="max-w-4xl mx-auto" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--grid-gap)' }}>
                {updates.map((u, i) => (
                  <Article key={u.id} update={u} index={i} isHero={i === 0 && t.layout === "editorial"} />
                ))}
              </div>
            )}

      </main>
    </div>
  )
}