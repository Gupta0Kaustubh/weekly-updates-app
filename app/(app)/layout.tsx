"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [role, setRole] = useState<"admin" | "member">("member")

  useEffect(() => {
    const fetchRole = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .single()

      if (profile?.role) setRole(profile.role)
    }

    fetchRole()
  }, [])

  const linkClass = (path: string) =>
    `group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      pathname === path
        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
        : "text-gray-400 hover:bg-white/5 hover:text-white"
    }`

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <div className="flex h-screen text-white">

      {/* Sidebar */}
      <aside className="w-72 border-r border-white/10 backdrop-blur-xl bg-white/5 p-6 flex flex-col justify-between">

        <div>
          <div className="mb-10">
            <h2 className="text-2xl font-bold tracking-tight">
              Weekly Chronicle
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Editorial Workspace
            </p>
          </div>

          <nav className="space-y-2">
            <Link href="/dashboard" className={linkClass("/dashboard")}>
              <span className="w-2 h-2 rounded-full bg-indigo-500 group-hover:scale-125 transition-transform"></span>
              Dashboard
            </Link>

            <Link href="/updates" className={linkClass("/updates")}>
              <span className="w-2 h-2 rounded-full bg-purple-500 group-hover:scale-125 transition-transform"></span>
              Updates
            </Link>

            {role === "admin" && (
              <Link href="/sortable" className={linkClass("/sortable")}>
                <span className="w-2 h-2 rounded-full bg-pink-500 group-hover:scale-125 transition-transform"></span>
                Sortable List
              </Link>
            )}
          </nav>
        </div>

        <div className="pt-6 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full py-3 rounded-xl bg-red-600/80 hover:bg-red-600 transition-all duration-200 shadow-lg hover:shadow-red-500/30"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-10">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}