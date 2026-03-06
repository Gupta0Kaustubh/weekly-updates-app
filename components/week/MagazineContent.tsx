import { Update } from "@/types"

type Props = {
  updates: Update[]
  weekTitle?: string
}

function formatDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function renderMentions(text: string) {
  return text.split(/(@\w+)/g).map((part, i) =>
    part.startsWith("@") ? (
      <span
        key={i}
        className="font-semibold text-indigo-600 bg-indigo-100 px-1 rounded"
      >
        {part}
      </span>
    ) : (
      part
    )
  )
}

export default function MagazineContent({ updates, weekTitle }: Props) {
  return (
    <div className="bg-[#f4f1ea] min-h-screen text-gray-900 font-serif">
      {/* Masthead */}
      <header className="text-center pt-10 pb-6 border-b border-black">
        <h1 className="text-7xl font-black tracking-tight uppercase">
          {weekTitle || "The Weekly Journal"}
        </h1>

        <p className="mt-3 text-xs tracking-[0.3em] uppercase">
          {formatDate()} • Editorial Edition
        </p>
      </header>

      {/* Articles */}
      <div className="px-6 md:px-12 py-10 space-y-16">
        {updates.map((update, index) => (
          <article
            key={update.id}
            className="border-b border-gray-400 pb-12"
          >
            {/* Headline */}
            <h2 className="text-5xl font-bold leading-tight mb-4">
              {update.title}
            </h2>

            {/* Byline */}
            <div className="text-sm mb-6 flex justify-between items-center border-y border-gray-300 py-2">
              <span>
                By{" "}
                <span className="font-semibold">
                  {update.submitted_by_name}
                </span>
              </span>

              <span className="uppercase tracking-widest text-xs">
                Story {String(index + 1).padStart(2, "0")}
              </span>
            </div>

            {/* Image */}
            {update.image_url && (
              <figure className="mb-6">
                <img
                  src={update.image_url}
                  alt={update.title}
                  className="w-full h-[300px] object-cover grayscale"
                />
                {/* <figcaption className="text-xs italic mt-1">
                  Photo related to the story
                </figcaption> */}
              </figure>
            )}

            {/* Body */}
            <div className="text-[15px] leading-[1.8] text-justify columns-1 gap-12">
              <p className="first-letter:text-8xl first-letter:font-bold first-letter:mr-3 first-letter:float-left first-letter:leading-none">
                {renderMentions(update.description)}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}