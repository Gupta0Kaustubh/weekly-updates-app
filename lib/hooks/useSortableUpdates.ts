import { useSensors, useSensor, PointerSensor } from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import { Update } from "@/types"
import { supabase } from "@/lib/supabase"

export const useSortableUpdates = (updates: Update[], setUpdates: (u: Update[]) => void, onRefresh?: () => void) => {
  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragEnd = async (activeId: string, overId: string) => {
    if (!overId || activeId === overId) return
    const oldIndex = updates.findIndex(u => u.id === activeId)
    const newIndex = updates.findIndex(u => u.id === overId)

    const newUpdates = arrayMove(updates, oldIndex, newIndex)
    setUpdates(newUpdates)

    await Promise.all(
      newUpdates.map((update, index) =>
        supabase.from("updates").update({ order_index: index }).eq("id", update.id)
      )
    )

    onRefresh?.()
  }

  return { sensors, handleDragEnd }
}