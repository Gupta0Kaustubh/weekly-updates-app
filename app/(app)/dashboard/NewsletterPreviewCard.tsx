import MagazineContent from "@/components/week/MagazineContent"
import { Update } from "@/types"

type Props = {
  updates: Update[]
  weekTitle?: string
}

export default function NewsletterPreviewCard({ updates, weekTitle }: Props) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden p-3">

      {/* Scaled preview */}
      <div className="origin-top-left scale-[0.18] w-[900px] pointer-events-none">
        <MagazineContent updates={updates.slice(0, 1)} weekTitle={weekTitle} />
      </div>

    </div>
  )
}